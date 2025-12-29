import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { ValidateVoucherDto } from './dto/validate-voucher.dto';
import { ERROR_CODES, getErrorMessage } from '@/common/constants/error-codes.constant';
import { CacheService } from '@/cache/cache.service';
import { CacheKeys, CachePatterns, CACHE_TTL } from '@/cache/cache-keys.constant';

@Injectable()
export class VouchersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async validate(validateVoucherDto: ValidateVoucherDto) {
    const cacheKey = CacheKeys.voucherByCode(validateVoucherDto.code);

    // Try cache first for voucher lookup
    type VoucherData = {
      id: number;
      code: string;
      discountType: string;
      discountValue: number;
      minOrderValue: number | null;
      maxDiscountAmount: number | null;
      startDate: Date | string | null;
      endDate: Date | string | null;
      usageLimit: number | null;
      usedCount: number;
      isActive: boolean;
    };

    let voucher = await this.cache.get<VoucherData>(cacheKey);

    if (!voucher) {
      const dbVoucher = await this.prisma.voucher.findFirst({
        where: {
          code: validateVoucherDto.code,
          isActive: true,
        },
      });

      if (dbVoucher) {
        // Cache voucher for 5 minutes
        await this.cache.set(cacheKey, dbVoucher, CACHE_TTL.SHORT);
        voucher = {
          id: dbVoucher.id,
          code: dbVoucher.code,
          discountType: dbVoucher.discountType,
          discountValue: Number(dbVoucher.discountValue),
          minOrderValue: dbVoucher.minOrderValue ? Number(dbVoucher.minOrderValue) : null,
          maxDiscountAmount: dbVoucher.maxDiscountAmount ? Number(dbVoucher.maxDiscountAmount) : null,
          startDate: dbVoucher.startDate,
          endDate: dbVoucher.endDate,
          usageLimit: dbVoucher.usageLimit,
          usedCount: dbVoucher.usedCount,
          isActive: dbVoucher.isActive,
        };
      }
    }

    if (!voucher) {
      throw new BadRequestException({
        code: ERROR_CODES.PAYMENT_003,
        message: getErrorMessage(ERROR_CODES.PAYMENT_003),
      });
    }

    const now = new Date();
    const startDate = voucher.startDate ? new Date(voucher.startDate) : null;
    const endDate = voucher.endDate ? new Date(voucher.endDate) : null;

    if (startDate && startDate > now) {
      throw new BadRequestException({
        code: ERROR_CODES.PAYMENT_003,
        message: 'Mã giảm giá chưa có hiệu lực.',
      });
    }

    if (endDate && endDate < now) {
      throw new BadRequestException({
        code: ERROR_CODES.PAYMENT_003,
        message: 'Mã giảm giá đã hết hạn.',
      });
    }

    if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
      throw new BadRequestException({
        code: ERROR_CODES.PAYMENT_003,
        message: 'Mã giảm giá đã hết lượt sử dụng.',
      });
    }

    if (voucher.minOrderValue && validateVoucherDto.orderValue < Number(voucher.minOrderValue)) {
      throw new BadRequestException({
        code: ERROR_CODES.PAYMENT_003,
        message: `Đơn hàng tối thiểu ${Number(voucher.minOrderValue).toLocaleString('vi-VN')} VND để áp dụng mã này.`,
      });
    }

    let discountAmount = 0;
    if (voucher.discountType === 'PERCENT') {
      discountAmount = (validateVoucherDto.orderValue * Number(voucher.discountValue)) / 100;
    } else {
      discountAmount = Number(voucher.discountValue);
    }

    if (voucher.maxDiscountAmount && discountAmount > Number(voucher.maxDiscountAmount)) {
      discountAmount = Number(voucher.maxDiscountAmount);
    }

    return {
      valid: true,
      code: voucher.code,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      discountAmount,
      message: 'Áp dụng mã giảm giá thành công!',
    };
  }

  async findAll() {
    const cacheKey = CacheKeys.voucherList();

    // Try cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const vouchers = await this.prisma.voucher.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Cache voucher list for 10 minutes
    await this.cache.set(cacheKey, vouchers, CACHE_TTL.MEDIUM);

    return vouchers;
  }

  async create(createVoucherDto: CreateVoucherDto) {
    const voucher = await this.prisma.voucher.create({
      data: {
        code: createVoucherDto.code.toUpperCase(),
        discountType: createVoucherDto.discountType,
        discountValue: createVoucherDto.discountValue,
        minOrderValue: createVoucherDto.minOrderValue,
        maxDiscountAmount: createVoucherDto.maxDiscountAmount,
        startDate: createVoucherDto.startDate ? new Date(createVoucherDto.startDate) : null,
        endDate: createVoucherDto.endDate ? new Date(createVoucherDto.endDate) : null,
        usageLimit: createVoucherDto.usageLimit,
        isActive: true,
      },
    });

    // Invalidate voucher list cache
    await this.cache.delPattern(CachePatterns.voucherLists());

    return voucher;
  }

  /**
   * Invalidate voucher cache when voucher is used or updated
   */
  async invalidateVoucherCache(code: string) {
    await this.cache.delMany([
      CacheKeys.voucherByCode(code),
      CacheKeys.voucherList(),
    ]);
  }
}
