import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as querystring from 'querystring';

export interface VNPayPaymentRequest {
  orderId: string;
  amount: number;
  orderInfo: string;
  returnUrl: string;
  ipAddress: string;
  locale?: 'vn' | 'en';
  bankCode?: string;
}

export interface VNPayReturnParams {
  vnp_TmnCode: string;
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_BankTranNo: string;
  vnp_CardType: string;
  vnp_PayDate: string;
  vnp_OrderInfo: string;
  vnp_TransactionNo: string;
  vnp_ResponseCode: string;
  vnp_TransactionStatus: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
  [key: string]: string;
}

@Injectable()
export class VNPayGateway {
  private readonly logger = new Logger(VNPayGateway.name);
  private readonly tmnCode: string;
  private readonly hashSecret: string;
  private readonly vnpUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.tmnCode = this.configService.get<string>('VNPAY_TMN_CODE') || '';
    this.hashSecret = this.configService.get<string>('VNPAY_HASH_SECRET') || '';
    this.vnpUrl =
      this.configService.get<string>('VNPAY_URL') ||
      'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  }

  /**
   * Create VNPay payment URL
   */
  createPaymentUrl(request: VNPayPaymentRequest): string {
    const date = new Date();
    const createDate = this.formatDate(date);
    const expireDate = this.formatDate(new Date(date.getTime() + 15 * 60 * 1000)); // 15 minutes

    const vnpParams: Record<string, string | number> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.tmnCode,
      vnp_Locale: request.locale || 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: request.orderId,
      vnp_OrderInfo: request.orderInfo,
      vnp_OrderType: 'other',
      vnp_Amount: request.amount * 100, // VNPay requires amount in VND * 100
      vnp_ReturnUrl: request.returnUrl,
      vnp_IpAddr: request.ipAddress,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    if (request.bankCode) {
      vnpParams.vnp_BankCode = request.bankCode;
    }

    // Sort parameters alphabetically
    const sortedParams = this.sortObject(vnpParams);

    // Create query string
    const signData = querystring.stringify(sortedParams, undefined, undefined, {
      encodeURIComponent: (str) => encodeURIComponent(str).replace(/%20/g, '+'),
    });

    // Create HMAC-SHA512 signature
    const secureHash = crypto.createHmac('sha512', this.hashSecret).update(signData).digest('hex');

    // Add secure hash to params
    sortedParams.vnp_SecureHash = secureHash;

    const paymentUrl = `${this.vnpUrl}?${querystring.stringify(sortedParams, undefined, undefined, {
      encodeURIComponent: (str) => encodeURIComponent(str).replace(/%20/g, '+'),
    })}`;

    this.logger.log(`Created VNPay payment URL for order ${request.orderId}`);

    return paymentUrl;
  }

  /**
   * Verify VNPay return/IPN signature
   */
  verifyReturn(params: VNPayReturnParams): boolean {
    const secureHash = params.vnp_SecureHash;

    // Remove hash fields before verification
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { vnp_SecureHash: _, ...verifyParams } = params;
    delete (verifyParams as Record<string, string>).vnp_SecureHashType;

    // Sort parameters
    const sortedParams = this.sortObject(verifyParams);

    // Create sign data
    const signData = querystring.stringify(sortedParams, undefined, undefined, {
      encodeURIComponent: (str) => encodeURIComponent(str).replace(/%20/g, '+'),
    });

    // Create expected signature
    const expectedHash = crypto
      .createHmac('sha512', this.hashSecret)
      .update(signData)
      .digest('hex');

    const isValid = secureHash.toLowerCase() === expectedHash.toLowerCase();

    if (!isValid) {
      this.logger.warn(`Invalid VNPay signature for order ${params.vnp_TxnRef}`);
    }

    return isValid;
  }

  /**
   * Parse VNPay return result
   */
  parseReturnResult(params: VNPayReturnParams) {
    return {
      orderId: params.vnp_TxnRef,
      transactionId: params.vnp_TransactionNo,
      amount: parseInt(params.vnp_Amount) / 100, // Convert back to VND
      bankCode: params.vnp_BankCode,
      bankTranNo: params.vnp_BankTranNo,
      cardType: params.vnp_CardType,
      payDate: params.vnp_PayDate,
      isSuccess: params.vnp_ResponseCode === '00' && params.vnp_TransactionStatus === '00',
      responseCode: params.vnp_ResponseCode,
      transactionStatus: params.vnp_TransactionStatus,
      message: this.getResponseMessage(params.vnp_ResponseCode),
    };
  }

  /**
   * Get response message from code
   */
  private getResponseMessage(responseCode: string): string {
    const messages: Record<string, string> = {
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)',
      '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking tại ngân hàng',
      '10': 'Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch',
      '12': 'Thẻ/Tài khoản bị khóa',
      '13': 'Quý khách nhập sai mật khẩu xác thực giao dịch (OTP)',
      '24': 'Khách hàng hủy giao dịch',
      '51': 'Tài khoản không đủ số dư để thực hiện giao dịch',
      '65': 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày',
      '75': 'Ngân hàng thanh toán đang bảo trì',
      '79': 'Nhập sai mật khẩu thanh toán quá số lần quy định',
      '99': 'Các lỗi khác',
    };

    return messages[responseCode] || 'Lỗi không xác định';
  }

  /**
   * Sort object keys alphabetically
   */
  private sortObject(obj: Record<string, string | number>): Record<string, string | number> {
    const sorted: Record<string, string | number> = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
      sorted[key] = obj[key];
    }
    return sorted;
  }

  /**
   * Format date for VNPay (yyyyMMddHHmmss)
   */
  private formatDate(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return (
      date.getFullYear().toString() +
      pad(date.getMonth() + 1) +
      pad(date.getDate()) +
      pad(date.getHours()) +
      pad(date.getMinutes()) +
      pad(date.getSeconds())
    );
  }

  /**
   * Check if gateway is configured
   */
  isConfigured(): boolean {
    return !!(this.tmnCode && this.hashSecret);
  }
}
