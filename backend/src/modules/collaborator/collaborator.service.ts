import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { WalletTransactionType, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
const MAX_VOUCHER_DISCOUNT = 100000;
const BASE_COMMISSION_PER_TICKET = 100000;
export interface CreateCollaboratorVoucherDto {
  code: string;
  discountType: 'PERCENT' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  startDate?: Date;
  endDate?: Date;
  usageLimit?: number;
}
export interface CommissionSummary {
  totalEarnings: number;
  pendingCommissions: number;
  availableBalance: number;
  totalOrders: number;
  totalTicketsSold: number;
}
export interface CommissionDetail {
  orderId: number;
  orderCode: string;
  orderDate: Date;
  customerName: string;
  ticketQty: number;
  totalCommission: number;
  discountGiven: number;
  netEarnings: number;
  paymentStatus: string;
  commissionStatus: 'LOCKED' | 'AVAILABLE';
}
@Injectable()
export class CollaboratorService {
  constructor(private readonly prisma: PrismaService) {}
  async getContent() {
    const content = await this.prisma.collaboratorContent.findFirst({
      orderBy: { updatedAt: 'desc' },
    });
    return content;
  }
  async updateContent(data: {
    title: string;
    content: string;
    bannerUrl?: string;
    benefits?: any;
    updatedBy: number;
  }) {
    const existing = await this.prisma.collaboratorContent.findFirst();
    if (existing) {
      return this.prisma.collaboratorContent.update({
        where: { id: existing.id },
        data: {
          title: data.title,
          content: data.content,
          bannerUrl: data.bannerUrl,
          benefits: data.benefits as Prisma.InputJsonValue,
          updatedBy: data.updatedBy,
        },
      });
    }
    return this.prisma.collaboratorContent.create({
      data: {
        title: data.title,
        content: data.content,
        bannerUrl: data.bannerUrl,
        benefits: data.benefits as Prisma.InputJsonValue,
        updatedBy: data.updatedBy,
      },
    });
  }
  async createVoucher(userId: number, dto: CreateCollaboratorVoucherDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || !user.isCollaborator) {
      throw new ForbiddenException('Bạn không phải là cộng tác viên');
    }
    if (dto.discountType === 'FIXED_AMOUNT' && dto.discountValue > MAX_VOUCHER_DISCOUNT) {
      throw new BadRequestException(
        `Giá trị giảm giá tối đa là ${MAX_VOUCHER_DISCOUNT.toLocaleString('vi-VN')} VND`,
      );
    }
    if (dto.discountType === 'PERCENT') {
      if (!dto.maxDiscountAmount || dto.maxDiscountAmount > MAX_VOUCHER_DISCOUNT) {
        throw new BadRequestException(
          `Giảm giá tối đa phải được đặt và không vượt quá ${MAX_VOUCHER_DISCOUNT.toLocaleString('vi-VN')} VND`,
        );
      }
    }
    const existingVoucher = await this.prisma.voucher.findUnique({
      where: { code: dto.code.toUpperCase() },
    });
    if (existingVoucher) {
      throw new BadRequestException('Mã voucher đã tồn tại');
    }
    return this.prisma.voucher.create({
      data: {
        code: dto.code.toUpperCase(),
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        minOrderValue: dto.minOrderValue,
        maxDiscountAmount: dto.maxDiscountAmount || MAX_VOUCHER_DISCOUNT,
        startDate: dto.startDate,
        endDate: dto.endDate,
        usageLimit: dto.usageLimit,
        isActive: true,
        createdBy: userId,
        ownerId: userId,
      },
    });
  }
  async getMyVouchers(userId: number) {
    return this.prisma.voucher.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }
  async getCommissionSummary(userId: number): Promise<CommissionSummary> {
    const wallet = await this.prisma.userWallet.findUnique({
      where: { userId },
    });
    const vouchers = await this.prisma.voucher.findMany({
      where: { ownerId: userId },
      select: { id: true },
    });
    const voucherIds = vouchers.map((v) => v.id);
    const bookingsWithCommission = await this.prisma.booking.findMany({
      where: {
        voucherId: { in: voucherIds },
        paymentStatus: 'PAID',
      },
      include: {
        items: true,
        voucher: true,
      },
    });
    let totalEarnings = 0;
    let totalTicketsSold = 0;
    for (const booking of bookingsWithCommission) {
      const ticketQty = booking.items.reduce((sum, item) => sum + item.quantity, 0);
      totalTicketsSold += ticketQty;
      const baseCommission = BASE_COMMISSION_PER_TICKET * ticketQty;
      const discountGiven = Number(booking.discountAmount);
      const netEarnings = Math.max(0, baseCommission - discountGiven);
      totalEarnings += netEarnings;
    }
    const pendingBookings = await this.prisma.booking.findMany({
      where: {
        voucherId: { in: voucherIds },
        paymentStatus: { not: 'PAID' },
        status: { not: 'CANCELLED' },
      },
      include: {
        items: true,
        voucher: true,
      },
    });
    let pendingCommissions = 0;
    for (const booking of pendingBookings) {
      const ticketQty = booking.items.reduce((sum, item) => sum + item.quantity, 0);
      const baseCommission = BASE_COMMISSION_PER_TICKET * ticketQty;
      const discountGiven = Number(booking.discountAmount);
      pendingCommissions += Math.max(0, baseCommission - discountGiven);
    }
    return {
      totalEarnings,
      pendingCommissions,
      availableBalance: wallet ? Number(wallet.balance) : 0,
      totalOrders: bookingsWithCommission.length,
      totalTicketsSold,
    };
  }
  async getCommissionDetails(
    userId: number,
    options: {
      page?: number;
      limit?: number;
      startDate?: Date;
      endDate?: Date;
      status?: 'PAID' | 'UNPAID';
    },
  ) {
    const { page = 1, limit = 20, startDate, endDate, status } = options;
    const vouchers = await this.prisma.voucher.findMany({
      where: { ownerId: userId },
      select: { id: true },
    });
    const voucherIds = vouchers.map((v) => v.id);
    const where: Prisma.BookingWhereInput = {
      voucherId: { in: voucherIds },
    };
    if (status === 'PAID') {
      where.paymentStatus = 'PAID';
    } else if (status === 'UNPAID') {
      where.paymentStatus = { not: 'PAID' };
      where.status = { not: 'CANCELLED' };
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }
    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          items: true,
          voucher: true,
          user: {
            select: {
              fullName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.booking.count({ where }),
    ]);
    const details: CommissionDetail[] = bookings.map((booking) => {
      const ticketQty = booking.items.reduce((sum, item) => sum + item.quantity, 0);
      const baseCommission = BASE_COMMISSION_PER_TICKET * ticketQty;
      const discountGiven = Number(booking.discountAmount);
      const netEarnings = Math.max(0, baseCommission - discountGiven);
      const fullName = booking.user.fullName;
      const maskedName =
        fullName.length > 2
          ? fullName[0] + '*'.repeat(fullName.length - 2) + fullName[fullName.length - 1]
          : fullName;
      return {
        orderId: booking.id,
        orderCode: booking.bookingCode,
        orderDate: booking.createdAt,
        customerName: maskedName,
        ticketQty,
        totalCommission: baseCommission,
        discountGiven,
        netEarnings,
        paymentStatus: booking.paymentStatus,
        commissionStatus: booking.paymentStatus === 'PAID' ? 'AVAILABLE' : 'LOCKED',
      };
    });
    return {
      data: details,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async processCommission(bookingId: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        items: true,
        voucher: {
          include: {
            owner: true,
          },
        },
      },
    });
    if (!booking || !booking.voucher || !booking.voucher.ownerId) {
      return null;
    }
    const collaboratorId = booking.voucher.ownerId;
    const ticketQty = booking.items.reduce((sum, item) => sum + item.quantity, 0);
    const baseCommission = BASE_COMMISSION_PER_TICKET * ticketQty;
    const discountGiven = Number(booking.discountAmount);
    const netCommission = Math.max(0, baseCommission - discountGiven);
    if (netCommission <= 0) {
      return null;
    }
    return this.prisma.$transaction(async (tx) => {
      let wallet = await tx.userWallet.findUnique({
        where: { userId: collaboratorId },
      });
      if (!wallet) {
        wallet = await tx.userWallet.create({
          data: {
            userId: collaboratorId,
            balance: 0,
            currency: 'VND',
          },
        });
      }
      const balanceBefore = wallet.balance;
      const balanceAfter = new Decimal(wallet.balance).plus(netCommission);
      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: collaboratorId,
          amount: netCommission,
          balanceBefore,
          balanceAfter,
          type: WalletTransactionType.COMMISSION,
          description: `Hoa hồng đơn hàng #${booking.bookingCode} (${ticketQty} vé)`,
          referenceId: `COMM_${booking.bookingCode}`,
        },
      });
      await tx.userWallet.update({
        where: { userId: collaboratorId },
        data: { balance: balanceAfter },
      });
      return {
        transactionId: transaction.id.toString(),
        amount: netCommission,
        collaboratorId,
      };
    });
  }
  async becomeCollaborator(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }
    if (user.isCollaborator) {
      throw new BadRequestException('Bạn đã là cộng tác viên');
    }
    let referralCode = user.referralCode;
    if (!referralCode) {
      const prefix = user.fullName
        ? user.fullName
            .split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 3)
        : 'CTV';
      const random = Math.floor(1000 + Math.random() * 9000);
      referralCode = `${prefix}${random}`;
      const existing = await this.prisma.user.findUnique({ where: { referralCode } });
      if (existing) {
        referralCode = `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
      }
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { isCollaborator: true, referralCode },
    });
  }
  async getAllCollaborators(options: { page?: number; limit?: number; search?: string }) {
    const { page = 1, limit = 20, search } = options;
    const where: Prisma.UserWhereInput = {
      isCollaborator: true,
      deletedAt: null,
    };
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          phoneNumber: true,
          email: true,
          isCollaborator: true,
          createdAt: true,
          wallet: {
            select: {
              balance: true,
            },
          },
          ownedVouchers: {
            select: {
              id: true,
              code: true,
              usedCount: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);
    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async toggleCollaboratorStatus(userId: number, isCollaborator: boolean) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { isCollaborator },
    });
  }
}
