import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@/prisma/prisma.service';
import { TransactionStatus, PaymentMethod, TransactionType } from '@prisma/client';
import { PayOSGateway } from './gateways/payos.gateway';
import { CacheService } from '@/cache/cache.service';
@Injectable()
export class PaymentsCronService {
  private readonly logger = new Logger(PaymentsCronService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly payosGateway: PayOSGateway,
  ) {}
  @Cron(CronExpression.EVERY_10_MINUTES)
  async reconcilePendingTransactions() {
    const lockKey = 'cron:payment-reconciliation';
    const lock = await this.cache.get(lockKey);
    if (lock) {
      this.logger.warn('Previous reconciliation still running, skipping this run');
      return;
    }
    await this.cache.set(lockKey, Date.now(), 600);
    try {
      this.logger.log('Starting PENDING transaction reconciliation');
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      const pendingTransactions = await this.prisma.transaction.findMany({
        where: {
          status: TransactionStatus.PENDING,
          type: TransactionType.PAYMENT,
          createdAt: { lt: fifteenMinutesAgo },
          paymentMethod: { in: [PaymentMethod.PAYOS] },
        },
        include: { booking: true },
        take: 50,
      });
      this.logger.log(`Found ${pendingTransactions.length} pending transactions to check`);
      for (const transaction of pendingTransactions) {
        try {
          await this.reconcileTransaction(transaction);
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          this.logger.error(`Failed to reconcile transaction ${transaction.id}: ${error.message}`);
        }
      }
      this.logger.log('Reconciliation completed successfully');
    } catch (error) {
      this.logger.error('Reconciliation job failed:', error.message);
    } finally {
      await this.cache.del(lockKey);
    }
  }
  private async reconcileTransaction(transaction: any) {
    const { id, gatewayTransId, paymentMethod } = transaction;
    this.logger.log(`Reconciling transaction ${id} (${paymentMethod})`);
    if (paymentMethod === PaymentMethod.PAYOS) {
      await this.reconcilePayOSTransaction(transaction);
    }
  }
  private async reconcilePayOSTransaction(transaction: any) {
    if (!this.payosGateway.isConfigured()) {
      this.logger.warn('PayOS gateway not configured, skipping reconciliation');
      return;
    }
    try {
      const orderCode = parseInt(transaction.gatewayTransId.replace(/[^0-9]/g, ''), 10);
      const gatewayStatus = await this.payosGateway.getPaymentInfo(orderCode);
      this.logger.log(`PayOS status for transaction ${transaction.id}: ${gatewayStatus.status}`);
      const statusMap: Record<string, TransactionStatus> = {
        PAID: TransactionStatus.SUCCESS,
        CANCELLED: TransactionStatus.FAILED,
        EXPIRED: TransactionStatus.FAILED,
        PENDING: TransactionStatus.PENDING,
      };
      const newStatus = statusMap[gatewayStatus.status];
      if (!newStatus || newStatus === TransactionStatus.PENDING) {
        this.logger.log(`Transaction ${transaction.id} still pending, no action taken`);
        return;
      }
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: newStatus,
          externalStatus: gatewayStatus.status,
          gatewayResponseLog: gatewayStatus,
          payTime: newStatus === TransactionStatus.SUCCESS ? new Date() : null,
        },
      });
      if (newStatus === TransactionStatus.SUCCESS) {
        const booking = await this.prisma.booking.findUnique({
          where: { id: transaction.bookingId },
        });
        if (booking && booking.paymentStatus !== 'PAID') {
          await this.prisma.booking.update({
            where: { id: transaction.bookingId },
            data: {
              status: 'CONFIRMED',
              paymentStatus: 'PAID',
            },
          });
          this.logger.log(`Updated booking ${booking.bookingCode} to PAID via cron reconciliation`);
        }
      }
      this.logger.log(`Transaction ${transaction.id} reconciled to ${newStatus}`);
    } catch (error) {
      if (error.message.includes('404') || error.message.includes('not found')) {
        await this.prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: TransactionStatus.FAILED,
            externalStatus: 'NOT_FOUND',
            gatewayResponseLog: { error: 'Payment not found on gateway' },
          },
        });
        this.logger.log(`Transaction ${transaction.id} marked as FAILED (not found on gateway)`);
      } else {
        throw error;
      }
    }
  }
}
