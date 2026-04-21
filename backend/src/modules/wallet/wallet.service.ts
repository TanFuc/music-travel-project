import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { WalletTransactionType, WithdrawalRequestStatus, Prisma } from '@prisma/client';
import { DepositDto } from './dto/deposit.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { getPaginationParams, paginate } from '@/common/utils/pagination.util';
import { ERROR_CODES, getErrorMessage } from '@/common/constants/error-codes.constant';
import { Decimal } from '@prisma/client/runtime/library';
export interface WithdrawRequestDto {
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}
export interface ProcessWithdrawalDto {
  adminNote?: string;
}
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
    const transaction = await this.prisma.$transaction(async (tx) => {
      const balanceBefore = wallet.balance;
      const balanceAfter = new Decimal(wallet.balance).plus(depositDto.amount);
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
  async requestWithdrawal(userId: number, dto: WithdrawRequestDto) {
    const wallet = await this.getOrCreateWallet(userId);
    if (wallet.status === 'LOCKED') {
      throw new BadRequestException({
        code: ERROR_CODES.PAYMENT_002,
        message: 'Ví đã bị khóa. Vui lòng liên hệ hỗ trợ.',
      });
    }
    if (new Decimal(wallet.balance).lessThan(dto.amount)) {
      throw new BadRequestException({
        code: ERROR_CODES.PAYMENT_002,
        message: 'Số dư không đủ để thực hiện rút tiền.',
      });
    }
    if (dto.amount < 50000) {
      throw new BadRequestException('Số tiền rút tối thiểu là 50,000 VND');
    }
    return this.prisma.$transaction(async (tx) => {
      const balanceBefore = wallet.balance;
      const balanceAfter = new Decimal(wallet.balance).minus(dto.amount);
      const request = await tx.withdrawalRequest.create({
        data: {
          userId,
          amount: dto.amount,
          bankName: dto.bankName,
          accountNumber: dto.accountNumber,
          accountHolder: dto.accountHolder,
          status: 'PENDING',
        },
      });
      await tx.walletTransaction.create({
        data: {
          walletId: userId,
          amount: -dto.amount,
          balanceBefore,
          balanceAfter,
          type: WalletTransactionType.WITHDRAWAL,
          description: `Yêu cầu rút tiền #${request.id}`,
          referenceId: `WD_${request.id}`,
        },
      });
      await tx.userWallet.update({
        where: { userId },
        data: { balance: balanceAfter },
      });
      return {
        requestId: request.id,
        amount: dto.amount,
        status: 'PENDING',
        message: 'Yêu cầu rút tiền đã được gửi. Vui lòng chờ admin xử lý.',
      };
    });
  }
  async getWithdrawalRequests(userId: number, pagination: PaginationDto) {
    const { skip, take } = getPaginationParams(pagination);
    const [requests, total] = await Promise.all([
      this.prisma.withdrawalRequest.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.withdrawalRequest.count({ where: { userId } }),
    ]);
    return paginate(requests, total, pagination.page || 1, pagination.limit || 10);
  }
  async getAllWithdrawalRequests(options: {
    page?: number;
    limit?: number;
    status?: WithdrawalRequestStatus;
    search?: string;
  }) {
    const { page = 1, limit = 20, status, search } = options;
    const where: Prisma.WithdrawalRequestWhereInput = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { user: { phoneNumber: { contains: search } } },
        { accountNumber: { contains: search } },
        { accountHolder: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.withdrawalRequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              phoneNumber: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.withdrawalRequest.count({ where }),
    ]);
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async approveWithdrawal(requestId: number, adminId: number, dto?: ProcessWithdrawalDto) {
    const request = await this.prisma.withdrawalRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) {
      throw new NotFoundException('Yêu cầu rút tiền không tồn tại');
    }
    if (request.status !== 'PENDING') {
      throw new BadRequestException('Yêu cầu này đã được xử lý');
    }
    return this.prisma.withdrawalRequest.update({
      where: { id: requestId },
      data: {
        status: 'APPROVED',
        adminNote: dto?.adminNote,
        processedBy: adminId,
        processedAt: new Date(),
      },
    });
  }
  async rejectWithdrawal(requestId: number, adminId: number, dto: ProcessWithdrawalDto) {
    const request = await this.prisma.withdrawalRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });
    if (!request) {
      throw new NotFoundException('Yêu cầu rút tiền không tồn tại');
    }
    if (request.status !== 'PENDING') {
      throw new BadRequestException('Yêu cầu này đã được xử lý');
    }
    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.userWallet.findUnique({
        where: { userId: request.userId },
      });
      if (!wallet) {
        throw new BadRequestException('Không tìm thấy ví người dùng');
      }
      const balanceBefore = wallet.balance;
      const balanceAfter = new Decimal(wallet.balance).plus(Number(request.amount));
      await tx.withdrawalRequest.update({
        where: { id: requestId },
        data: {
          status: 'REJECTED',
          adminNote: dto.adminNote,
          processedBy: adminId,
          processedAt: new Date(),
        },
      });
      await tx.walletTransaction.create({
        data: {
          walletId: request.userId,
          amount: Number(request.amount),
          balanceBefore,
          balanceAfter,
          type: WalletTransactionType.REFUND,
          description: `Hoàn tiền từ yêu cầu rút tiền #${requestId} bị từ chối`,
          referenceId: `WD_REFUND_${requestId}`,
        },
      });
      await tx.userWallet.update({
        where: { userId: request.userId },
        data: { balance: balanceAfter },
      });
      return {
        message: 'Đã từ chối yêu cầu và hoàn tiền cho người dùng',
        requestId,
      };
    });
  }
  async getWithdrawalStats() {
    const [total, pending, approved, rejected, totalAmount] = await Promise.all([
      this.prisma.withdrawalRequest.count(),
      this.prisma.withdrawalRequest.count({ where: { status: 'PENDING' } }),
      this.prisma.withdrawalRequest.count({ where: { status: 'APPROVED' } }),
      this.prisma.withdrawalRequest.count({ where: { status: 'REJECTED' } }),
      this.prisma.withdrawalRequest.aggregate({
        where: { status: 'APPROVED' },
        _sum: { amount: true },
      }),
    ]);
    return {
      total,
      pending,
      approved,
      rejected,
      totalAmountApproved: totalAmount._sum.amount || 0,
    };
  }
  async addCommission(userId: number, amount: number, referenceId: string, description: string) {
    const wallet = await this.getOrCreateWallet(userId);
    return this.prisma.$transaction(async (tx) => {
      const balanceBefore = wallet.balance;
      const balanceAfter = new Decimal(wallet.balance).plus(amount);
      await tx.walletTransaction.create({
        data: {
          walletId: userId,
          amount,
          balanceBefore,
          balanceAfter,
          type: WalletTransactionType.COMMISSION,
          description,
          referenceId,
        },
      });
      await tx.userWallet.update({
        where: { userId },
        data: { balance: balanceAfter },
      });
      return { balance: balanceAfter };
    });
  }
}
