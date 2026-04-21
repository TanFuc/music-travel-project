import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import {
  PaymentMethod,
  TransactionStatus,
  BookingStatus,
  PaymentStatus,
  RefundMethod,
  RefundStatus,
  TransactionType,
} from '@prisma/client';
import { CheckoutDto } from './dto/checkout.dto';
import { CreateRefundDto } from './dto/refund.dto';
import { WalletService } from '../wallet/wallet.service';
import { TicketsService } from '../tickets/tickets.service';
import { CacheService } from '@/cache/cache.service';
import { CacheKeys, CACHE_TTL } from '@/cache/cache-keys.constant';
import { ERROR_CODES, getErrorMessage } from '@/common/constants/error-codes.constant';
import { MoMoGateway, MoMoWebhookPayload } from './gateways/momo.gateway';
import { VNPayGateway, VNPayReturnParams } from './gateways/vnpay.gateway';
import { PayOSGateway, PayOSWebhookPayload } from './gateways/payos.gateway';
import { EnhancedLoggerService } from '@/common/services/enhanced-logger.service';
import { LogMethod } from '@/common/decorators/log-method.decorator';
export interface CheckoutResult {
  transactionId?: number;
  bookingCode: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: string;
  message: string;
  paymentUrl?: string;
}
@Injectable()
export class PaymentsService {
  private readonly logger: EnhancedLoggerService;
  private readonly appUrl: string;
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly ticketsService: TicketsService,
    private readonly cache: CacheService,
    private readonly configService: ConfigService,
    private readonly momoGateway: MoMoGateway,
    private readonly vnpayGateway: VNPayGateway,
    private readonly payosGateway: PayOSGateway,
    private readonly enhancedLoggerService: EnhancedLoggerService,
  ) {
    this.logger = this.enhancedLoggerService.createChild(PaymentsService.name);
    this.appUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3000';
  }
  @LogMethod({ logParams: true, sanitize: true })
  async checkout(
    userId: number,
    checkoutDto: CheckoutDto,
    ipAddress?: string,
  ): Promise<CheckoutResult> {
    this.logger.log('Processing checkout', {
      userId,
      bookingCode: checkoutDto.bookingCode,
      paymentMethod: checkoutDto.paymentMethod,
      ipAddress,
    });
    const booking = await this.prisma.booking.findFirst({
      where: {
        bookingCode: checkoutDto.bookingCode,
        userId,
        status: BookingStatus.PENDING,
        paymentStatus: PaymentStatus.UNPAID,
      },
      include: {
        items: { include: { ticket: true } },
      },
    });
    if (!booking) {
      this.logger.warn('Checkout failed - booking not found', {
        userId,
        bookingCode: checkoutDto.bookingCode,
      });
      throw new NotFoundException({
        code: ERROR_CODES.BOOKING_001,
        message: getErrorMessage(ERROR_CODES.BOOKING_001),
      });
    }
    let amount = Number(booking.finalAmount);
    this.logger.debug('Booking found for checkout', {
      bookingId: booking.id,
      originalAmount: amount,
      paymentMethod: checkoutDto.paymentMethod,
    });
    const paymentConfig = await this.prisma.paymentMethodConfig.findFirst({
      where: {
        method: checkoutDto.paymentMethod,
        isActive: true,
      },
    });
    if (paymentConfig && Number(paymentConfig.discountPercentage) > 0) {
      const discount = Math.round(amount * (Number(paymentConfig.discountPercentage) / 100));
      amount -= discount;
      this.logger.log(
        `Applied payment discount: ${discount} (${paymentConfig.discountPercentage}%) for method ${checkoutDto.paymentMethod}`,
      );
    }
    if (checkoutDto.paymentMethod === PaymentMethod.WALLET) {
      this.logger.debug('Processing wallet payment', { userId, bookingId: booking.id, amount });
      return this.processWalletPayment(userId, booking.id, amount, booking.bookingCode);
    }
    const transaction = await this.prisma.transaction.create({
      data: {
        bookingId: booking.id,
        userId,
        paymentMethod: checkoutDto.paymentMethod,
        amount,
        status: TransactionStatus.PENDING,
      },
    });
    const orderId = `${booking.bookingCode}_${transaction.id}`;
    const orderInfo = `Thanh toan don hang ${booking.bookingCode}`;
    const returnUrl = `${this.appUrl}/payment/callback`;
    const notifyUrl = `${this.appUrl}/api/v1/payments/webhook`;
    try {
      let paymentUrl: string;
      switch (checkoutDto.paymentMethod) {
        case PaymentMethod.MOMO:
          if (!this.momoGateway.isConfigured()) {
            throw new BadRequestException({
              code: ERROR_CODES.PAYMENT_001,
              message: 'Phương thức thanh toán MoMo chưa được cấu hình.',
            });
          }
          const momoResponse = await this.momoGateway.createPayment({
            orderId,
            amount,
            orderInfo,
            returnUrl,
            notifyUrl: `${notifyUrl}/momo`,
            extraData: Buffer.from(JSON.stringify({ bookingId: booking.id })).toString('base64'),
          });
          paymentUrl = momoResponse.payUrl;
          break;
        case PaymentMethod.VNPAY:
          if (!this.vnpayGateway.isConfigured()) {
            throw new BadRequestException({
              code: ERROR_CODES.PAYMENT_001,
              message: 'Phương thức thanh toán VNPay chưa được cấu hình.',
            });
          }
          paymentUrl = this.vnpayGateway.createPaymentUrl({
            orderId,
            amount,
            orderInfo,
            returnUrl: `${notifyUrl}/vnpay`,
            ipAddress: ipAddress || '127.0.0.1',
          });
          break;
        case PaymentMethod.PAYOS:
          if (!this.payosGateway.isConfigured()) {
            throw new BadRequestException({
              code: ERROR_CODES.PAYMENT_001,
              message: 'Phương thức thanh toán PayOS chưa được cấu hình.',
            });
          }
          const payosResponse = await this.payosGateway.createPayment({
            orderId,
            amount,
            orderInfo,
            returnUrl,
            cancelUrl: `${this.appUrl}/payment/cancel`,
          });
          paymentUrl = payosResponse.checkoutUrl;
          break;
        case PaymentMethod.BANKING:
        case PaymentMethod.BANK_QR:
          return {
            transactionId: transaction.id,
            bookingCode: booking.bookingCode,
            amount,
            paymentMethod: checkoutDto.paymentMethod,
            status: 'PENDING',
            message: 'Vui lòng chuyển khoản theo thông tin bên dưới.',
            paymentUrl: undefined,
          };
        default:
          throw new BadRequestException({
            code: ERROR_CODES.PAYMENT_001,
            message: 'Phương thức thanh toán không được hỗ trợ.',
          });
      }
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          gatewayTransId: orderId,
          extraData: { orderId, gateway: checkoutDto.paymentMethod },
        },
      });
      this.logger.log(
        `Created payment for booking ${booking.bookingCode} via ${checkoutDto.paymentMethod}`,
      );
      return {
        transactionId: transaction.id,
        bookingCode: booking.bookingCode,
        amount,
        paymentMethod: checkoutDto.paymentMethod,
        status: 'PENDING',
        message: 'Đang chuyển hướng đến cổng thanh toán...',
        paymentUrl,
      };
    } catch (error) {
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: TransactionStatus.FAILED,
          gatewayResponseLog: { error: error.message },
        },
      });
      throw error;
    }
  }
  private async processWalletPayment(
    userId: number,
    bookingId: number,
    amount: number,
    bookingCode: string,
  ): Promise<CheckoutResult> {
    await this.walletService.deductBalance(userId, amount, bookingCode);
    await this.prisma.$transaction(async (tx) => {
      await tx.transaction.create({
        data: {
          bookingId,
          userId,
          paymentMethod: PaymentMethod.WALLET,
          amount,
          status: TransactionStatus.SUCCESS,
          payTime: new Date(),
        },
      });
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.CONFIRMED,
          paymentStatus: PaymentStatus.PAID,
        },
      });
      const ticketItems = await tx.bookingItem.findMany({
        where: { bookingId, itemType: 'SHOW_TICKET' },
      });
      const ticketIds = ticketItems.filter((i) => i.ticketId).map((i) => i.ticketId as number);
      if (ticketIds.length > 0) {
        await this.ticketsService.markTicketsAsSold(ticketIds, bookingId);
      }
      const tierItems = await tx.bookingItem.findMany({
        where: { bookingId, ticketTierId: { not: null } },
      });
      for (const item of tierItems) {
        if (item.ticketTierId && item.quantity > 0) {
          await this.ticketsService.generateTicketsForBooking(
            bookingId,
            item.ticketTierId,
            item.quantity,
          );
        }
      }
      const tourItems = await tx.bookingItem.findMany({
        where: { bookingId, itemType: 'TOUR_SLOT' },
      });
      for (const item of tourItems) {
        if (item.tourScheduleId) {
          await tx.tourSchedule.update({
            where: { id: item.tourScheduleId },
            data: { bookedCount: { increment: item.quantity } },
          });
        }
      }
    });
    await this.cache.del(CacheKeys.bookingByCode(bookingCode));
    await this.cache.del(CacheKeys.userBookings(userId));
    return {
      bookingCode,
      amount,
      paymentMethod: PaymentMethod.WALLET,
      status: 'PAID',
      message: 'Thanh toán thành công!',
    };
  }
  @LogMethod({ logParams: false, sanitize: true })
  async handleWebhook(
    gateway: string,
    payload: Record<string, unknown>,
    _headers?: Record<string, string>,
  ) {
    this.logger.log('Received payment webhook', {
      gateway,
      payloadKeys: Object.keys(payload),
    });
    switch (gateway.toLowerCase()) {
      case 'momo':
        return this.handleMoMoWebhook(payload as unknown as MoMoWebhookPayload);
      case 'vnpay':
        return this.handleVNPayWebhook(payload as unknown as VNPayReturnParams);
      case 'payos':
        return this.handlePayOSWebhook(payload as unknown as PayOSWebhookPayload);
      default:
        this.logger.warn(`Unknown gateway: ${gateway}`);
        return { received: true, processed: false };
    }
  }
  private async handleMoMoWebhook(payload: MoMoWebhookPayload) {
    if (!this.momoGateway.verifyWebhook(payload)) {
      this.logger.error('Invalid MoMo webhook signature');
      return { success: false, message: 'Invalid signature' };
    }
    const result = this.momoGateway.parseWebhookResult(payload);
    const idempotencyKey = CacheKeys.webhookIdempotency('momo', result.transactionId);
    const existingWebhook = await this.cache.get(idempotencyKey);
    if (existingWebhook) {
      this.logger.log(`Duplicate MoMo webhook for transaction ${result.transactionId}`);
      return { success: true, message: 'Already processed' };
    }
    await this.cache.set(
      idempotencyKey,
      { processedAt: new Date().toISOString() },
      CACHE_TTL.WEBHOOK_IDEMPOTENCY,
    );
    const transaction = await this.prisma.transaction.findFirst({
      where: { gatewayTransId: result.orderId },
      include: { booking: true },
    });
    if (!transaction) {
      this.logger.error(`Transaction not found for MoMo order ${result.orderId}`);
      return { success: false, message: 'Transaction not found' };
    }
    if (transaction.booking.paymentStatus === PaymentStatus.PAID) {
      this.logger.warn(
        `Booking ${transaction.booking.bookingCode} already paid - duplicate webhook ignored`,
      );
      return { success: true, message: 'Already paid' };
    }
    if (transaction.status !== TransactionStatus.PENDING) {
      this.logger.log(`Transaction ${transaction.id} already processed`);
      return { success: true, message: 'Already processed' };
    }
    return this.processPaymentResult(
      transaction.id,
      transaction.bookingId,
      transaction.userId,
      result.isSuccess,
      result.transactionId,
      result.message,
      payload,
    );
  }
  private async handleVNPayWebhook(params: VNPayReturnParams) {
    if (!this.vnpayGateway.verifyReturn(params)) {
      this.logger.error('Invalid VNPay return signature');
      return { RspCode: '97', Message: 'Invalid signature' };
    }
    const result = this.vnpayGateway.parseReturnResult(params);
    const idempotencyKey = CacheKeys.webhookIdempotency('vnpay', result.transactionId);
    const existingWebhook = await this.cache.get(idempotencyKey);
    if (existingWebhook) {
      this.logger.log(`Duplicate VNPay webhook for transaction ${result.transactionId}`);
      return { RspCode: '00', Message: 'Already processed' };
    }
    await this.cache.set(
      idempotencyKey,
      { processedAt: new Date().toISOString() },
      CACHE_TTL.WEBHOOK_IDEMPOTENCY,
    );
    const transaction = await this.prisma.transaction.findFirst({
      where: { gatewayTransId: result.orderId },
      include: { booking: true },
    });
    if (!transaction) {
      this.logger.error(`Transaction not found for VNPay order ${result.orderId}`);
      return { RspCode: '01', Message: 'Order not found' };
    }
    if (transaction.booking.paymentStatus === PaymentStatus.PAID) {
      this.logger.warn(
        `Booking ${transaction.booking.bookingCode} already paid - duplicate webhook ignored`,
      );
      return { RspCode: '00', Message: 'Already paid' };
    }
    if (transaction.status !== TransactionStatus.PENDING) {
      this.logger.log(`Transaction ${transaction.id} already processed`);
      return { RspCode: '00', Message: 'Already processed' };
    }
    await this.processPaymentResult(
      transaction.id,
      transaction.bookingId,
      transaction.userId,
      result.isSuccess,
      result.transactionId,
      result.message,
      params,
    );
    return { RspCode: '00', Message: 'Success' };
  }
  private async handlePayOSWebhook(payload: PayOSWebhookPayload) {
    const isValid = await this.payosGateway.verifyWebhook(payload);
    if (!isValid) {
      this.logger.error('Invalid PayOS webhook signature');
      return { success: false, message: 'Invalid signature' };
    }
    const result = this.payosGateway.parseWebhookResult(payload);
    const idempotencyKey = CacheKeys.webhookIdempotency('payos', result.transactionId);
    const existingWebhook = await this.cache.get(idempotencyKey);
    if (existingWebhook) {
      this.logger.log(`Duplicate PayOS webhook for transaction ${result.transactionId}`);
      return { success: true, message: 'Already processed' };
    }
    await this.cache.set(
      idempotencyKey,
      { processedAt: new Date().toISOString() },
      CACHE_TTL.WEBHOOK_IDEMPOTENCY,
    );
    const transaction = await this.prisma.transaction.findFirst({
      where: { gatewayTransId: result.orderId },
      include: { booking: true },
    });
    if (!transaction) {
      this.logger.error(`Transaction not found for PayOS order ${result.orderId}`);
      return { success: false, message: 'Transaction not found' };
    }
    if (transaction.booking.paymentStatus === PaymentStatus.PAID) {
      this.logger.warn(
        `Booking ${transaction.booking.bookingCode} already paid - duplicate webhook ignored`,
      );
      return { success: true, message: 'Already paid' };
    }
    if (transaction.status !== TransactionStatus.PENDING) {
      this.logger.log(`Transaction ${transaction.id} already processed`);
      return { success: true, message: 'Already processed' };
    }
    const expectedAmount = Number(transaction.amount);
    const actualAmount = result.amount;
    const tolerance = 100;
    if (Math.abs(expectedAmount - actualAmount) > tolerance) {
      this.logger.error(
        `POTENTIAL FRAUD: Amount mismatch for transaction ${transaction.id}. Expected: ${expectedAmount}, Actual: ${actualAmount}`,
      );
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          externalStatus: result.externalStatus,
          gatewayResponseLog: payload as object,
        },
      });
      await this.prisma.booking.update({
        where: { id: transaction.bookingId },
        data: { status: BookingStatus.MANUAL_REVIEW },
      });
      return { success: false, message: 'Amount mismatch - manual review required' };
    }
    return this.processPaymentResult(
      transaction.id,
      transaction.bookingId,
      transaction.userId,
      result.isSuccess,
      result.transactionId,
      result.message,
      payload,
    );
  }
  private async processPaymentResult(
    transactionId: number,
    bookingId: number,
    userId: number,
    isSuccess: boolean,
    gatewayTransId: string,
    message: string,
    rawPayload: unknown,
  ) {
    if (isSuccess) {
      await this.prisma.$transaction(async (tx) => {
        await tx.transaction.update({
          where: { id: transactionId },
          data: {
            status: TransactionStatus.SUCCESS,
            gatewayTransId,
            gatewayResponseLog: rawPayload as object,
            payTime: new Date(),
          },
        });
        await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: BookingStatus.CONFIRMED,
            paymentStatus: PaymentStatus.PAID,
          },
        });
        const ticketItems = await tx.bookingItem.findMany({
          where: { bookingId, itemType: 'SHOW_TICKET' },
        });
        const ticketIds = ticketItems.filter((i) => i.ticketId).map((i) => i.ticketId as number);
        if (ticketIds.length > 0) {
          await this.ticketsService.markTicketsAsSold(ticketIds, bookingId);
        }
        const tierItems = await tx.bookingItem.findMany({
          where: { bookingId, ticketTierId: { not: null } },
        });
        for (const item of tierItems) {
          if (item.ticketTierId && item.quantity > 0) {
            await this.ticketsService.generateTicketsForBooking(
              bookingId,
              item.ticketTierId,
              item.quantity,
            );
          }
        }
        const tourItems = await tx.bookingItem.findMany({
          where: { bookingId, itemType: 'TOUR_SLOT' },
        });
        for (const item of tourItems) {
          if (item.tourScheduleId) {
            await tx.tourSchedule.update({
              where: { id: item.tourScheduleId },
              data: { bookedCount: { increment: item.quantity } },
            });
          }
        }
      });
      const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
      if (booking) {
        await this.cache.del(CacheKeys.bookingByCode(booking.bookingCode));
        await this.cache.del(CacheKeys.userBookings(userId));
      }
      this.logger.log(`Payment successful for booking ${bookingId}`);
      return { success: true, message: 'Payment processed successfully' };
    } else {
      await this.prisma.transaction.update({
        where: { id: transactionId },
        data: {
          status: TransactionStatus.FAILED,
          gatewayTransId,
          gatewayResponseLog: rawPayload as object,
        },
      });
      this.logger.log(`Payment failed for booking ${bookingId}: ${message}`);
      return { success: false, message };
    }
  }
  async getTransactionStatus(transactionId: number, userId: number) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id: transactionId, userId },
      include: {
        booking: {
          select: { bookingCode: true, status: true, paymentStatus: true },
        },
      },
    });
    if (!transaction) {
      throw new NotFoundException({
        code: ERROR_CODES.PAYMENT_001,
        message: 'Không tìm thấy giao dịch.',
      });
    }
    return {
      transactionId: transaction.id,
      bookingCode: transaction.booking.bookingCode,
      amount: transaction.amount,
      paymentMethod: transaction.paymentMethod,
      status: transaction.status,
      bookingStatus: transaction.booking.status,
      paymentStatus: transaction.booking.paymentStatus,
      payTime: transaction.payTime,
      createdAt: transaction.createdAt,
    };
  }
  @LogMethod({ logParams: true, sanitize: true })
  async createRefund(userId: number, refundDto: CreateRefundDto) {
    this.logger.log('Processing refund request', {
      userId,
      bookingCode: refundDto.bookingCode,
      amount: refundDto.amount,
      refundMethod: refundDto.refundMethod,
    });
    const booking = await this.prisma.booking.findFirst({
      where: {
        bookingCode: refundDto.bookingCode,
        userId,
        paymentStatus: PaymentStatus.PAID,
      },
      include: {
        refunds: true,
        transactions: {
          where: { status: TransactionStatus.SUCCESS, type: TransactionType.PAYMENT },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
    if (!booking) {
      this.logger.warn('Refund failed - paid booking not found', {
        userId,
        bookingCode: refundDto.bookingCode,
      });
      throw new NotFoundException({
        code: ERROR_CODES.BOOKING_001,
        message: 'Không tìm thấy đơn hàng đã thanh toán.',
      });
    }
    const totalRefunded = booking.refunds
      .filter((r) => r.status === RefundStatus.COMPLETED)
      .reduce((sum, r) => sum + Number(r.amount), 0);
    const remainingAmount = Number(booking.finalAmount) - totalRefunded;
    this.logger.debug('Calculated refund amounts', {
      bookingId: booking.id,
      finalAmount: booking.finalAmount,
      totalRefunded,
      remainingAmount,
      requestedAmount: refundDto.amount,
    });
    if (refundDto.amount > remainingAmount) {
      this.logger.warn('Refund amount exceeds remaining amount', {
        bookingId: booking.id,
        requestedAmount: refundDto.amount,
        remainingAmount,
      });
      throw new BadRequestException({
        code: ERROR_CODES.PAYMENT_005,
        message: `Số tiền hoàn không được vượt quá ${remainingAmount} VND.`,
      });
    }
    const originalTransaction = booking.transactions[0];
    if (!originalTransaction) {
      throw new NotFoundException({
        code: ERROR_CODES.PAYMENT_001,
        message: 'Không tìm thấy giao dịch thanh toán gốc.',
      });
    }
    const result = await this.prisma.$transaction(async (tx) => {
      const refund = await tx.refund.create({
        data: {
          bookingId: booking.id,
          transactionId: originalTransaction.id,
          amount: refundDto.amount,
          reason: refundDto.reason,
          refundMethod: refundDto.refundMethod,
          status: RefundStatus.PROCESSING,
          createdBy: userId,
        },
      });
      const refundTransaction = await tx.transaction.create({
        data: {
          bookingId: booking.id,
          userId,
          paymentMethod: originalTransaction.paymentMethod,
          amount: refundDto.amount,
          status: TransactionStatus.PENDING,
          type: TransactionType.REFUND,
          gatewayTransId: `REFUND_${refund.id}`,
        },
      });
      return { refund, refundTransaction };
    });
    try {
      if (refundDto.refundMethod === RefundMethod.ORIGINAL_METHOD) {
        await this.processGatewayRefund(
          originalTransaction.paymentMethod,
          originalTransaction.gatewayTransId || '',
          refundDto.amount,
          refundDto.reason || 'Customer request',
        );
      } else if (refundDto.refundMethod === RefundMethod.WALLET) {
        await this.walletService.refundToWallet(
          userId,
          refundDto.amount,
          `Hoàn tiền đơn hàng ${booking.bookingCode}`,
        );
      }
      await this.prisma.$transaction(async (tx) => {
        await tx.refund.update({
          where: { id: result.refund.id },
          data: {
            status: RefundStatus.COMPLETED,
            refundedAt: new Date(),
          },
        });
        await tx.transaction.update({
          where: { id: result.refundTransaction.id },
          data: {
            status: TransactionStatus.SUCCESS,
            payTime: new Date(),
          },
        });
        const newTotalRefunded = totalRefunded + refundDto.amount;
        const isFullyRefunded = newTotalRefunded >= Number(booking.finalAmount);
        await tx.booking.update({
          where: { id: booking.id },
          data: {
            paymentStatus: isFullyRefunded
              ? PaymentStatus.REFUNDED
              : PaymentStatus.PARTIALLY_REFUNDED,
          },
        });
      });
      this.logger.log(
        `Refund completed for booking ${booking.bookingCode}: ${refundDto.amount} VND`,
      );
      return {
        success: true,
        message: 'Hoàn tiền thành công.',
        refundId: result.refund.id,
        amount: refundDto.amount,
        refundMethod: refundDto.refundMethod,
      };
    } catch (error) {
      await this.prisma.refund.update({
        where: { id: result.refund.id },
        data: { status: RefundStatus.FAILED },
      });
      await this.prisma.transaction.update({
        where: { id: result.refundTransaction.id },
        data: { status: TransactionStatus.FAILED },
      });
      this.logger.error(`Refund failed for booking ${booking.bookingCode}:`, error.message);
      throw new BadRequestException({
        code: ERROR_CODES.PAYMENT_005,
        message: 'Hoàn tiền thất bại. Vui lòng thử lại sau.',
      });
    }
  }
  private async processGatewayRefund(
    paymentMethod: PaymentMethod,
    gatewayTransId: string,
    amount: number,
    reason: string,
  ) {
    switch (paymentMethod) {
      case PaymentMethod.PAYOS:
        const orderCode = parseInt(gatewayTransId.replace(/[^0-9]/g, ''), 10);
        await this.payosGateway.cancelPayment(orderCode, reason);
        break;
      case PaymentMethod.MOMO:
        this.logger.warn('MoMo refund not yet implemented');
        throw new Error('MoMo refund not yet implemented');
      case PaymentMethod.VNPAY:
        this.logger.warn('VNPay refund not yet implemented');
        throw new Error('VNPay refund not yet implemented');
      default:
        throw new Error(`Gateway refund not supported for ${paymentMethod}`);
    }
  }
  async getRefundsByBooking(userId: number, bookingCode: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { bookingCode, userId },
      include: {
        refunds: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!booking) {
      throw new NotFoundException({
        code: ERROR_CODES.BOOKING_001,
        message: getErrorMessage(ERROR_CODES.BOOKING_001),
      });
    }
    return {
      bookingCode: booking.bookingCode,
      totalAmount: booking.finalAmount,
      paymentStatus: booking.paymentStatus,
      refunds: booking.refunds.map((refund) => ({
        id: refund.id,
        amount: refund.amount,
        reason: refund.reason,
        refundMethod: refund.refundMethod,
        status: refund.status,
        refundedAt: refund.refundedAt,
        createdAt: refund.createdAt,
      })),
    };
  }
}
