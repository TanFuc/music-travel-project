import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';

export interface MoMoPaymentRequest {
  orderId: string;
  amount: number;
  orderInfo: string;
  returnUrl: string;
  notifyUrl: string;
  extraData?: string;
}

export interface MoMoPaymentResponse {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  responseTime: number;
  message: string;
  resultCode: number;
  payUrl: string;
  shortLink?: string;
}

export interface MoMoWebhookPayload {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  orderInfo: string;
  orderType: string;
  transId: number;
  resultCode: number;
  message: string;
  payType: string;
  responseTime: number;
  extraData: string;
  signature: string;
}

@Injectable()
export class MoMoGateway {
  private readonly logger = new Logger(MoMoGateway.name);
  private readonly partnerCode: string;
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly endpoint: string;

  constructor(private readonly configService: ConfigService) {
    this.partnerCode = this.configService.get<string>('MOMO_PARTNER_CODE') || '';
    this.accessKey = this.configService.get<string>('MOMO_ACCESS_KEY') || '';
    this.secretKey = this.configService.get<string>('MOMO_SECRET_KEY') || '';
    this.endpoint =
      this.configService.get<string>('MOMO_ENDPOINT') ||
      'https://test-payment.momo.vn/v2/gateway/api/create';
  }

  /**
   * Create MoMo payment request
   */
  async createPayment(request: MoMoPaymentRequest): Promise<MoMoPaymentResponse> {
    const requestId = `${request.orderId}_${Date.now()}`;
    const requestType = 'payWithMethod';
    const extraData = request.extraData || '';

    // Build raw signature string
    const rawSignature = [
      `accessKey=${this.accessKey}`,
      `amount=${request.amount}`,
      `extraData=${extraData}`,
      `ipnUrl=${request.notifyUrl}`,
      `orderId=${request.orderId}`,
      `orderInfo=${request.orderInfo}`,
      `partnerCode=${this.partnerCode}`,
      `redirectUrl=${request.returnUrl}`,
      `requestId=${requestId}`,
      `requestType=${requestType}`,
    ].join('&');

    // Create HMAC-SHA256 signature
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(rawSignature)
      .digest('hex');

    const requestBody = {
      partnerCode: this.partnerCode,
      partnerName: 'Music Travel',
      storeId: 'MusicTravel',
      requestId,
      amount: request.amount,
      orderId: request.orderId,
      orderInfo: request.orderInfo,
      redirectUrl: request.returnUrl,
      ipnUrl: request.notifyUrl,
      lang: 'vi',
      requestType,
      autoCapture: true,
      extraData,
      signature,
    };

    this.logger.log(`Creating MoMo payment for order ${request.orderId}`);

    try {
      const response = await axios.post<MoMoPaymentResponse>(this.endpoint, requestBody, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      });

      if (response.data.resultCode !== 0) {
        this.logger.error(`MoMo payment creation failed: ${response.data.message}`);
        throw new Error(`MoMo error: ${response.data.message}`);
      }

      return response.data;
    } catch (error) {
      this.logger.error(`MoMo API error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify MoMo webhook signature
   */
  verifyWebhook(payload: MoMoWebhookPayload): boolean {
    const { signature, ...data } = payload;

    // Build raw signature string for verification
    const rawSignature = [
      `accessKey=${this.accessKey}`,
      `amount=${data.amount}`,
      `extraData=${data.extraData}`,
      `message=${data.message}`,
      `orderId=${data.orderId}`,
      `orderInfo=${data.orderInfo}`,
      `orderType=${data.orderType}`,
      `partnerCode=${data.partnerCode}`,
      `payType=${data.payType}`,
      `requestId=${data.requestId}`,
      `responseTime=${data.responseTime}`,
      `resultCode=${data.resultCode}`,
      `transId=${data.transId}`,
    ].join('&');

    const expectedSignature = crypto
      .createHmac('sha256', this.secretKey)
      .update(rawSignature)
      .digest('hex');

    const isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));

    if (!isValid) {
      this.logger.warn(`Invalid MoMo webhook signature for order ${data.orderId}`);
    }

    return isValid;
  }

  /**
   * Parse webhook result
   */
  parseWebhookResult(payload: MoMoWebhookPayload) {
    return {
      orderId: payload.orderId,
      transactionId: String(payload.transId),
      isSuccess: payload.resultCode === 0,
      resultCode: payload.resultCode,
      message: payload.message,
      amount: payload.amount,
      payType: payload.payType,
    };
  }

  /**
   * Check if gateway is configured
   */
  isConfigured(): boolean {
    return !!(this.partnerCode && this.accessKey && this.secretKey);
  }
}
