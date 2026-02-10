import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(PaymentsService.name);
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
  ) {
    this.appUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3000';
  }

  async checkout(
    userId: number,
    checkoutDto: CheckoutDto,
    ipAddress?: string,
  ): Promise<CheckoutResult> {
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
      throw new NotFoundException({
        code: ERROR_CODES.BOOKING_001,
        message: getErrorMessage(ERROR_CODES.BOOKING_001),
      });
    }

    const amount = Number(booking.finalAmount);

    // Handle wallet payment
    if (checkoutDto.paymentMethod === PaymentMethod.WALLET) {
      return this.processWalletPayment(userId, booking.id, amount, booking.bookingCode);
    }

    // Create pending transaction first
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
          // For bank transfer, return bank account info instead of redirect URL
          return {
            transactionId: transaction.id,
            bookingCode: booking.bookingCode,
            amount,
            paymentMethod: checkoutDto.paymentMethod,
            status: 'PENDING',
            message: 'Vui lòng chuyển khoản theo thông tin bên dưới.',
            paymentUrl: undefined, // Bank transfer info would be handled by frontend
          };

        default:
          throw new BadRequestException({
            code: ERROR_CODES.PAYMENT_001,
            message: 'Phương thức thanh toán không được hỗ trợ.',
          });
      }

      // Update transaction with gateway info
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
      // Mark transaction as failed if gateway call fails
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
      // Create transaction record
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

      // Update booking status
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.CONFIRMED,
          paymentStatus: PaymentStatus.PAID,
        },
      });

      // Mark tickets as sold
      const ticketItems = await tx.bookingItem.findMany({
        where: { bookingId, itemType: 'SHOW_TICKET' },
      });

      const ticketIds = ticketItems.filter((i) => i.ticketId).map((i) => i.ticketId as number);
      if (ticketIds.length > 0) {
        await this.ticketsService.markTicketsAsSold(ticketIds, bookingId);
      }

      // Generate tickets for Ticket Tiers (New Flow)
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

      // Update tour booked count
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

    // Invalidate booking cache
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

  async handleWebhook(
    gateway: string,
    payload: Record<string, unknown>,
    _headers?: Record<string, string>,
  ) {
    this.logger.log(`Received webhook from ${gateway}`);

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
    // Verify signature
    if (!this.momoGateway.verifyWebhook(payload)) {
      this.logger.error('Invalid MoMo webhook signature');
      return { success: false, message: 'Invalid signature' };
    }

    const result = this.momoGateway.parseWebhookResult(payload);

    // Check idempotency
    const idempotencyKey = CacheKeys.webhookIdempotency('momo', result.transactionId);
    const existingWebhook = await this.cache.get(idempotencyKey);
    if (existingWebhook) {
      this.logger.log(`Duplicate MoMo webhook for transaction ${result.transactionId}`);
      return { success: true, message: 'Already processed' };
    }

    // Store idempotency key
    await this.cache.set(
      idempotencyKey,
      { processedAt: new Date().toISOString() },
      CACHE_TTL.WEBHOOK_IDEMPOTENCY,
    );

    // Find transaction by orderId
    const transaction = await this.prisma.transaction.findFirst({
      where: { gatewayTransId: result.orderId },
      include: { booking: true },
    });

    if (!transaction) {
      this.logger.error(`Transaction not found for MoMo order ${result.orderId}`);
      return { success: false, message: 'Transaction not found' };
    }

    // Double payment prevention check
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

    // Process payment result
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
    // Verify signature
    if (!this.vnpayGateway.verifyReturn(params)) {
      this.logger.error('Invalid VNPay return signature');
      return { RspCode: '97', Message: 'Invalid signature' };
    }

    const result = this.vnpayGateway.parseReturnResult(params);

    // Check idempotency
    const idempotencyKey = CacheKeys.webhookIdempotency('vnpay', result.transactionId);
    const existingWebhook = await this.cache.get(idempotencyKey);
    if (existingWebhook) {
      this.logger.log(`Duplicate VNPay webhook for transaction ${result.transactionId}`);
      return { RspCode: '00', Message: 'Already processed' };
    }

    // Store idempotency key
    await this.cache.set(
      idempotencyKey,
      { processedAt: new Date().toISOString() },
      CACHE_TTL.WEBHOOK_IDEMPOTENCY,
    );

    // Find transaction by orderId
    const transaction = await this.prisma.transaction.findFirst({
      where: { gatewayTransId: result.orderId },
      include: { booking: true },
    });

    if (!transaction) {
      this.logger.error(`Transaction not found for VNPay order ${result.orderId}`);
      return { RspCode: '01', Message: 'Order not found' };
    }

    // Double payment prevention check
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

    // Process payment result
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
    // Verify signature
    const isValid = await this.payosGateway.verifyWebhook(payload);
    if (!isValid) {
      this.logger.error('Invalid PayOS webhook signature');
      return { success: false, message: 'Invalid signature' };
    }

    const result = this.payosGateway.parseWebhookResult(payload);

    // Check idempotency
    const idempotencyKey = CacheKeys.webhookIdempotency('payos', result.transactionId);
    const existingWebhook = await this.cache.get(idempotencyKey);
    if (existingWebhook) {
      this.logger.log(`Duplicate PayOS webhook for transaction ${result.transactionId}`);
      return { success: true, message: 'Already processed' };
    }

    // Store idempotency key
    await this.cache.set(
      idempotencyKey,
      { processedAt: new Date().toISOString() },
      CACHE_TTL.WEBHOOK_IDEMPOTENCY,
    );

    // Find transaction by orderId
    const transaction = await this.prisma.transaction.findFirst({
      where: { gatewayTransId: result.orderId },
      include: { booking: true },
    });

    if (!transaction) {
      this.logger.error(`Transaction not found for PayOS order ${result.orderId}`);
      return { success: false, message: 'Transaction not found' };
    }

    // Double payment prevention check
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

    // Amount mismatch validation
    const expectedAmount = Number(transaction.amount);
    const actualAmount = result.amount;
    const tolerance = 100; // VND tolerance

    if (Math.abs(expectedAmount - actualAmount) > tolerance) {
      this.logger.error(
        `POTENTIAL FRAUD: Amount mismatch for transaction ${transaction.id}. Expected: ${expectedAmount}, Actual: ${actualAmount}`,
      );

      // Update transaction with external status
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          externalStatus: result.externalStatus,
          gatewayResponseLog: payload as object,
        },
      });

      // Mark booking for manual review
      await this.prisma.booking.update({
        where: { id: transaction.bookingId },
        data: { status: BookingStatus.MANUAL_REVIEW },
      });

      return { success: false, message: 'Amount mismatch - manual review required' };
    }

    // Process payment result
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
        // Update transaction
        await tx.transaction.update({
          where: { id: transactionId },
          data: {
            status: TransactionStatus.SUCCESS,
            gatewayTransId,
            gatewayResponseLog: rawPayload as object,
            payTime: new Date(),
          },
        });

        // Update booking
        await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: BookingStatus.CONFIRMED,
            paymentStatus: PaymentStatus.PAID,
          },
        });

        // Mark tickets as sold
        const ticketItems = await tx.bookingItem.findMany({
          where: { bookingId, itemType: 'SHOW_TICKET' },
        });

        const ticketIds = ticketItems.filter((i) => i.ticketId).map((i) => i.ticketId as number);
        // Mark show tickets as sold (Old flow)
        if (ticketIds.length > 0) {
          await this.ticketsService.markTicketsAsSold(ticketIds, bookingId);
        }

        // Generate tickets for Ticket Tiers (New Flow)
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

        // Update tour booked count
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

      // Invalidate caches
      const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
      if (booking) {
        await this.cache.del(CacheKeys.bookingByCode(booking.bookingCode));
        await this.cache.del(CacheKeys.userBookings(userId));
      }

      this.logger.log(`Payment successful for booking ${bookingId}`);
      return { success: true, message: 'Payment processed successfully' };
    } else {
      // Update transaction as failed
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

  /**
   * Get transaction status
   */
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

  /**
   * Create a refund for a booking
   */
  async createRefund(userId: number, refundDto: CreateRefundDto) {
    // Find booking
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
      throw new NotFoundException({
        code: ERROR_CODES.BOOKING_001,
        message: 'Không tìm thấy đơn hàng đã thanh toán.',
      });
    }

    // Calculate total refunded amount
    const totalRefunded = booking.refunds
      .filter((r) => r.status === RefundStatus.COMPLETED)
      .reduce((sum, r) => sum + Number(r.amount), 0);

    const remainingAmount = Number(booking.finalAmount) - totalRefunded;

    // Validate refund amount
    if (refundDto.amount > remainingAmount) {
      throw new BadRequestException({
        code: ERROR_CODES.PAYMENT_005,
        message: `Số tiền hoàn không được vượt quá ${remainingAmount} VND.`,
      });
    }

    // Get original payment transaction
    const originalTransaction = booking.transactions[0];

    if (!originalTransaction) {
      throw new NotFoundException({
        code: ERROR_CODES.PAYMENT_001,
        message: 'Không tìm thấy giao dịch thanh toán gốc.',
      });
    }

    // Create refund and transaction in a single transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create refund record
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

      // Create refund transaction
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

    // Process the refund through gateway or wallet
    try {
      if (refundDto.refundMethod === RefundMethod.ORIGINAL_METHOD) {
        await this.processGatewayRefund(
          originalTransaction.paymentMethod,
          originalTransaction.gatewayTransId || '',
          refundDto.amount,
          refundDto.reason || 'Customer request',
        );
      } else if (refundDto.refundMethod === RefundMethod.WALLET) {
        // Credit to wallet
        await this.walletService.refundToWallet(
          userId,
          refundDto.amount,
          `Hoàn tiền đơn hàng ${booking.bookingCode}`,
        );
      }

      // Update refund and transaction status
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

        // Update booking payment status
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
      // Mark refund as failed
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

  /**
   * Process gateway refund
   */
  private async processGatewayRefund(
    paymentMethod: PaymentMethod,
    gatewayTransId: string,
    amount: number,
    reason: string,
  ) {
    switch (paymentMethod) {
      case PaymentMethod.PAYOS:
        // Extract orderCode from gatewayTransId
        const orderCode = parseInt(gatewayTransId.replace(/[^0-9]/g, ''), 10);
        await this.payosGateway.cancelPayment(orderCode, reason);
        break;

      case PaymentMethod.MOMO:
        // MoMo refund implementation would go here
        this.logger.warn('MoMo refund not yet implemented');
        throw new Error('MoMo refund not yet implemented');

      case PaymentMethod.VNPAY:
        // VNPay refund implementation would go here
        this.logger.warn('VNPay refund not yet implemented');
        throw new Error('VNPay refund not yet implemented');

      default:
        throw new Error(`Gateway refund not supported for ${paymentMethod}`);
    }
  }

  /**
   * Get refunds for a booking
   */
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
