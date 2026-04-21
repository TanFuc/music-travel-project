import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PayOS } from '@payos/node';
export interface PayOSPaymentRequest {
  orderId: string;
  amount: number;
  orderInfo: string;
  returnUrl: string;
  cancelUrl: string;
}
export interface PayOSPaymentResponse {
  checkoutUrl: string;
  orderCode: number;
  transactionId: string;
}
export interface PayOSWebhookPayload {
  code: string;
  desc: string;
  success: boolean;
  data: {
    orderCode: number;
    amount: number;
    description: string;
    accountNumber: string;
    reference: string;
    transactionDateTime: string;
    currency: string;
    paymentLinkId: string;
    code: string;
    desc: string;
    counterAccountBankId: string;
    counterAccountBankName: string;
    counterAccountName: string;
    counterAccountNumber: string;
    virtualAccountName: string;
    virtualAccountNumber: string;
  };
  signature: string;
}
export interface PayOSWebhookResult {
  orderId: string;
  transactionId: string;
  amount: number;
  isSuccess: boolean;
  externalStatus: string;
  message: string;
}
@Injectable()
export class PayOSGateway {
  private readonly logger = new Logger(PayOSGateway.name);
  private payos: PayOS | null = null;
  constructor(private readonly configService: ConfigService) {
    this.initializePayOS();
  }
  private initializePayOS() {
    const clientId = this.configService.get<string>('PAYOS_CLIENT_ID');
    const apiKey = this.configService.get<string>('PAYOS_API_KEY');
    const checksumKey = this.configService.get<string>('PAYOS_CHECKSUM_KEY');
    if (!clientId || !apiKey || !checksumKey) {
      this.logger.warn('PayOS credentials not configured. PayOS gateway will be disabled.');
      return;
    }
    try {
      this.payos = new PayOS({
        clientId,
        apiKey,
        checksumKey,
      });
      this.logger.log('PayOS gateway initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize PayOS:', error.message);
    }
  }
  isConfigured(): boolean {
    return this.payos !== null;
  }
  async createPayment(request: PayOSPaymentRequest): Promise<PayOSPaymentResponse> {
    if (!this.payos) {
      throw new Error('PayOS is not configured');
    }
    try {
      const orderCode = parseInt(request.orderId.replace(/[^0-9]/g, ''), 10);
      const paymentData = {
        orderCode,
        amount: Math.round(request.amount),
        description: request.orderInfo,
        returnUrl: request.returnUrl,
        cancelUrl: request.cancelUrl,
      };
      this.logger.log(`Creating PayOS payment: ${JSON.stringify(paymentData)}`);
      const response = await this.payos.paymentRequests.create(paymentData);
      return {
        checkoutUrl: response.checkoutUrl,
        orderCode: response.orderCode,
        transactionId: response.paymentLinkId,
      };
    } catch (error) {
      this.logger.error('PayOS payment creation failed:', error.message);
      throw new Error(`PayOS payment creation failed: ${error.message}`);
    }
  }
  async verifyWebhook(payload: PayOSWebhookPayload): Promise<boolean> {
    if (!this.payos) {
      throw new Error('PayOS is not configured');
    }
    try {
      await this.payos.webhooks.verify(payload);
      return true;
    } catch (error) {
      this.logger.error('PayOS webhook verification error:', error.message);
      return false;
    }
  }
  parseWebhookResult(payload: PayOSWebhookPayload): PayOSWebhookResult {
    const data = payload.data;
    const isSuccess = payload.code === '00' && payload.success === true;
    return {
      orderId: data.orderCode.toString(),
      transactionId: data.paymentLinkId || data.reference,
      amount: data.amount,
      isSuccess,
      externalStatus: payload.code,
      message: payload.desc || 'Payment processed',
    };
  }
  async getPaymentInfo(orderCode: number): Promise<any> {
    if (!this.payos) {
      throw new Error('PayOS is not configured');
    }
    try {
      const paymentInfo = await this.payos.paymentRequests.get(orderCode);
      return {
        orderCode: paymentInfo.orderCode,
        amount: paymentInfo.amount,
        status: paymentInfo.status,
        transactionDateTime: paymentInfo.transactions?.[0]?.transactionDateTime,
      };
    } catch (error) {
      this.logger.error(`Failed to get PayOS payment info for ${orderCode}:`, error.message);
      throw error;
    }
  }
  async cancelPayment(orderCode: number, reason: string): Promise<any> {
    if (!this.payos) {
      throw new Error('PayOS is not configured');
    }
    try {
      this.logger.log(`Cancelling PayOS payment ${orderCode}: ${reason}`);
      const result = await this.payos.paymentRequests.cancel(orderCode, reason);
      return {
        success: true,
        orderCode: result.orderCode,
        cancelledAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to cancel PayOS payment ${orderCode}:`, error.message);
      throw new Error(`PayOS cancellation failed: ${error.message}`);
    }
  }
}
