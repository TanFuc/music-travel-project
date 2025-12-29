import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { WalletTransactionType } from '@prisma/client';
import { DepositDto } from './dto/deposit.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { getPaginationParams, paginate } from '@/common/utils/pagination.util';
import { ERROR_CODES, getErrorMessage } from '@/common/constants/error-codes.constant';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async getBalance(userId: number) {
    const wallet = await this.getOrCreateWallet(userId);
    return {
      balance: wallet.balance,
      currency: wallet.currency,
      status: wallet.status,
    };
  }

  async getTransactions(userId: number, pagination: PaginationDto) {
    const wallet = await this.getOrCreateWallet(userId);
    const { skip, take } = getPaginationParams(pagination);

    const [transactions, total] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where: { walletId: wallet.userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.walletTransaction.count({
        where: { walletId: wallet.userId },
      }),
    ]);

    return paginate(transactions, total, pagination.page || 1, pagination.limit || 10);
  }

  async deposit(userId: number, depositDto: DepositDto) {
    const wallet = await this.getOrCreateWallet(userId);

    if (wallet.status === 'LOCKED') {
      throw new BadRequestException({
        code: ERROR_CODES.PAYMENT_002,
        message: 'Ví đã bị khóa. Vui lòng liên hệ hỗ trợ.',
      });
    }

    // In a real implementation, this would integrate with a payment gateway
    // For now, we'll just record the deposit request
    const transaction = await this.prisma.$transaction(async (tx) => {
      const balanceBefore = wallet.balance;
      const balanceAfter = new Decimal(wallet.balance).plus(depositDto.amount);

      // Create transaction record
      const txRecord = await tx.walletTransaction.create({
        data: {
          walletId: userId,
          amount: depositDto.amount,
          balanceBefore,
          balanceAfter,
          type: WalletTransactionType.DEPOSIT,
          description: `Nạp tiền vào ví`,
          referenceId: `DEP_${Date.now()}`,
        },
      });

      // Update wallet balance
      await tx.userWallet.update({
        where: { userId },
        data: { balance: balanceAfter },
      });

      return txRecord;
    });

    return {
      transactionId: transaction.id.toString(),
      amount: depositDto.amount,
      message: 'Nạp tiền thành công',
    };
  }

  async deductBalance(userId: number, amount: number, referenceId: string): Promise<boolean> {
    const wallet = await this.getOrCreateWallet(userId);

    if (wallet.status === 'LOCKED') {
      throw new BadRequestException({
        code: ERROR_CODES.PAYMENT_002,
        message: getErrorMessage(ERROR_CODES.PAYMENT_002),
      });
    }

    if (new Decimal(wallet.balance).lessThan(amount)) {
      throw new BadRequestException({
        code: ERROR_CODES.PAYMENT_002,
        message: getErrorMessage(ERROR_CODES.PAYMENT_002),
      });
    }

    await this.prisma.$transaction(async (tx) => {
      const balanceBefore = wallet.balance;
      const balanceAfter = new Decimal(wallet.balance).minus(amount);

      await tx.walletTransaction.create({
        data: {
          walletId: userId,
          amount: -amount,
          balanceBefore,
          balanceAfter,
          type: WalletTransactionType.PAYMENT,
          description: 'Thanh toán đơn hàng',
          referenceId,
        },
      });

      await tx.userWallet.update({
        where: { userId },
        data: { balance: balanceAfter },
      });
    });

    return true;
  }

  async refundToWallet(userId: number, amount: number, referenceId: string): Promise<boolean> {
    const wallet = await this.getOrCreateWallet(userId);

    await this.prisma.$transaction(async (tx) => {
      const balanceBefore = wallet.balance;
      const balanceAfter = new Decimal(wallet.balance).plus(amount);

      await tx.walletTransaction.create({
        data: {
          walletId: userId,
          amount,
          balanceBefore,
          balanceAfter,
          type: WalletTransactionType.REFUND,
          description: 'Hoàn tiền đơn hàng',
          referenceId,
        },
      });

      await tx.userWallet.update({
        where: { userId },
        data: { balance: balanceAfter },
      });
    });

    return true;
  }

  private async getOrCreateWallet(userId: number) {
    let wallet = await this.prisma.userWallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      wallet = await this.prisma.userWallet.create({
        data: {
          userId,
          balance: 0,
          currency: 'VND',
        },
      });
    }

    return wallet;
  }
}
