import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { BookingStatus, PaymentStatus, BookingItemType, TransactionStatus } from '@prisma/client';
import { CreateBookingDto } from './dto/create-booking.dto';
import { TicketsService } from '../tickets/tickets.service';
import { ToursService } from '../tours/tours.service';
import { ERROR_CODES, getErrorMessage } from '@/common/constants/error-codes.constant';
import { Decimal } from '@prisma/client/runtime/library';
import { CacheService } from '@/cache/cache.service';
import { CacheKeys, CACHE_TTL } from '@/cache/cache-keys.constant';
import { EnhancedLoggerService } from '@/common/services/enhanced-logger.service';
import { LogMethod } from '@/common/decorators/log-method.decorator';
import { CollaboratorService } from '../collaborator/collaborator.service';
@Injectable()
export class BookingsService {
  private readonly logger: EnhancedLoggerService;
  constructor(
    private readonly prisma: PrismaService,
    private readonly ticketsService: TicketsService,
    private readonly toursService: ToursService,
    private readonly cache: CacheService,
    private readonly collaboratorService: CollaboratorService,
    private readonly enhancedLoggerService: EnhancedLoggerService,
  ) {
    this.logger = this.enhancedLoggerService.createChild(BookingsService.name);
  }
  @LogMethod({ logParams: true, sanitize: true })
  async create(userId: number, createBookingDto: CreateBookingDto) {
    this.logger.log('Starting booking creation', {
      userId,
      ticketsWithSeatsCount: createBookingDto.ticketsWithSeats?.length ?? 0,
      ticketIdsCount: createBookingDto.ticketIds?.length ?? 0,
      tourItemsCount: createBookingDto.tourItems?.length ?? 0,
      singerPackagesCount: createBookingDto.singerPackages?.length ?? 0,
    });
    const hasTickets =
      (createBookingDto.ticketsWithSeats?.length ?? 0) > 0 ||
      (createBookingDto.ticketIds?.length ?? 0) > 0;
    const hasTours = (createBookingDto.tourItems?.length ?? 0) > 0;
    const hasSingerPackages = (createBookingDto.singerPackages?.length ?? 0) > 0;
    if (!hasTickets && !hasTours && !hasSingerPackages) {
      this.logger.warn('Booking validation failed - no items provided', { userId });
      throw new BadRequestException({
        code: ERROR_CODES.VAL_001,
        message:
          'Đơn hàng phải có ít nhất một mục: vé (ticketsWithSeats/ticketIds), tour (tourItems), hoặc gói ca sĩ (singerPackages).',
      });
    }
    const bookingCode = this.generateBookingCode();
    this.logger.debug('Generated booking code', { bookingCode, userId });
    let totalAmount = new Decimal(0);
    const ticketItems: {
      ticketId: number;
      price: Decimal;
      physicalSeatId?: number;
    }[] = [];
    if (createBookingDto.ticketsWithSeats?.length) {
      const ticketIds = createBookingDto.ticketsWithSeats.map((t) => t.ticketId);
      const tickets = await this.prisma.ticket.findMany({
        where: {
          id: { in: ticketIds },
          holderUserId: userId,
          status: 'LOCKED',
        },
        include: {
          ticketClass: true,
          show: true,
        },
      });
      if (tickets.length !== ticketIds.length) {
        throw new BadRequestException({
          code: ERROR_CODES.TICKET_002,
          message: getErrorMessage(ERROR_CODES.TICKET_002),
        });
      }
      for (const ticketWithSeat of createBookingDto.ticketsWithSeats) {
        const ticket = tickets.find((t) => t.id === ticketWithSeat.ticketId);
        if (!ticket) continue;
        if (ticket.show?.seatSelectionEnabled && ticketWithSeat.physicalSeatId) {
          const seat = await this.prisma.physicalSeat.findFirst({
            where: {
              id: ticketWithSeat.physicalSeatId,
              stageId: ticket.show?.stageId,
            },
          });
          if (!seat) {
            throw new BadRequestException({
              code: ERROR_CODES.SEAT_001,
              message: 'Chỗ ngồi không tồn tại hoặc không thuộc sân khấu này.',
            });
          }
          const existingTicket = await this.prisma.ticket.findFirst({
            where: {
              showId: ticket.showId,
              physicalSeatId: ticketWithSeat.physicalSeatId,
              status: { in: ['LOCKED', 'SOLD'] },
              id: { not: ticket.id },
            },
          });
          if (existingTicket) {
            throw new BadRequestException({
              code: ERROR_CODES.SEAT_002,
              message: `Chỗ ngồi ${seat.zoneName || ''} ${seat.rowName || ''}-${seat.seatNumber || ''} đã được đặt.`,
            });
          }
        }
        ticketItems.push({
          ticketId: ticket.id,
          price: (ticket.ticketClass?.price as unknown as Decimal) || new Decimal(0),
          physicalSeatId: ticketWithSeat.physicalSeatId,
        });
        totalAmount = totalAmount.plus((ticket.ticketClass?.price as unknown as Decimal) || 0);
      }
    } else if (createBookingDto.ticketIds?.length) {
      const tickets = await this.prisma.ticket.findMany({
        where: {
          id: { in: createBookingDto.ticketIds },
          holderUserId: userId,
          status: 'LOCKED',
        },
        include: { ticketClass: true },
      });
      if (tickets.length !== createBookingDto.ticketIds.length) {
        throw new BadRequestException({
          code: ERROR_CODES.TICKET_002,
          message: getErrorMessage(ERROR_CODES.TICKET_002),
        });
      }
      for (const ticket of tickets) {
        ticketItems.push({
          ticketId: ticket.id,
          price: (ticket.ticketClass?.price as unknown as Decimal) || new Decimal(0),
        });
        totalAmount = totalAmount.plus((ticket.ticketClass?.price as unknown as Decimal) || 0);
      }
    }
    const tourItems: {
      scheduleId: number;
      quantity: number;
      price: Decimal;
      ticketTypeName?: string;
      passengerInfo?: Record<string, unknown>[];
    }[] = [];
    if (createBookingDto.tourItems?.length) {
      for (const item of createBookingDto.tourItems) {
        await this.toursService.checkScheduleAvailability(item.scheduleId, item.quantity);
        const schedule = await this.prisma.tourSchedule.findUnique({
          where: { id: item.scheduleId },
          include: {
            tour: {
              select: {
                properties: true,
              },
            },
          },
        });
        if (schedule) {
          let unitPrice = schedule.price;
          let resolvedTicketTypeName: string | undefined;
          if (item.ticketTypeName?.trim()) {
            const normalizedTypeName = item.ticketTypeName.trim().toLowerCase();
            const tourProperties = (schedule.tour?.properties || {}) as {
              ticketTypes?: Array<{
                name?: string;
                price?: number;
              }>;
            };
            const matchedTicketType = tourProperties.ticketTypes?.find(
              (ticketType) => ticketType?.name?.trim().toLowerCase() === normalizedTypeName,
            );
            if (!matchedTicketType || typeof matchedTicketType.price !== 'number') {
              throw new BadRequestException({
                code: ERROR_CODES.VAL_001,
                message: `Loại vé tour không hợp lệ cho lịch #${item.scheduleId}.`,
              });
            }
            unitPrice = new Decimal(matchedTicketType.price);
            resolvedTicketTypeName = matchedTicketType.name?.trim() || item.ticketTypeName.trim();
          }
          const itemTotal = unitPrice.mul(item.quantity);
          tourItems.push({
            scheduleId: item.scheduleId,
            quantity: item.quantity,
            price: unitPrice,
            ticketTypeName: resolvedTicketTypeName,
            passengerInfo: item.passengerInfo,
          });
          totalAmount = totalAmount.plus(itemTotal);
        }
      }
    }
    const singerPackageItems: {
      packageId: string;
      quantity: number;
      price: Decimal;
    }[] = [];
    if (createBookingDto.singerPackages?.length) {
      const packageIds = createBookingDto.singerPackages.map((p) => p.packageId);
      const packages = await this.prisma.singerPackageTemplate.findMany({
        where: { id: { in: packageIds }, isActive: true },
      });
      if (packages.length !== packageIds.length) {
        throw new BadRequestException({
          code: ERROR_CODES.VAL_001,
          message: 'Một số gói ca sĩ không tồn tại hoặc ngừng hoạt động.',
        });
      }
      for (const item of createBookingDto.singerPackages) {
        const pkg = packages.find((p) => p.id === item.packageId);
        if (pkg) {
          const itemTotal = pkg.price.mul(item.quantity);
          singerPackageItems.push({
            packageId: item.packageId,
            quantity: item.quantity,
            price: pkg.price,
          });
          totalAmount = totalAmount.plus(itemTotal);
        }
      }
    }
    let discountAmount = new Decimal(0);
    let voucher: any = null;
    if (createBookingDto.voucherCode) {
      voucher = await this.prisma.voucher.findFirst({
        where: {
          code: createBookingDto.voucherCode,
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
      });
      if (voucher) {
        if (voucher.minOrderValue && totalAmount.lessThan(voucher.minOrderValue)) {
          throw new BadRequestException({
            code: ERROR_CODES.PAYMENT_003,
            message: 'Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã giảm giá.',
          });
        }
        if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
          throw new BadRequestException({
            code: ERROR_CODES.PAYMENT_003,
            message: 'Mã giảm giá đã hết lượt sử dụng.',
          });
        }
        if (voucher.discountType === 'PERCENT') {
          discountAmount = totalAmount.mul(voucher.discountValue).div(100);
        } else {
          discountAmount = voucher.discountValue;
        }
        if (voucher.maxDiscountAmount && discountAmount.greaterThan(voucher.maxDiscountAmount)) {
          discountAmount = voucher.maxDiscountAmount;
        }
      }
    }
    const finalAmount = totalAmount.minus(discountAmount);
    this.logger.debug('Calculated booking amounts', {
      userId,
      bookingCode,
      totalAmount: totalAmount.toString(),
      discountAmount: discountAmount.toString(),
      finalAmount: finalAmount.toString(),
    });
    this.logger.debug('Starting database transaction for booking creation', {
      userId,
      bookingCode,
    });
    const booking = await this.prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          bookingCode,
          userId,
          totalAmount,
          discountAmount,
          finalAmount,
          status: BookingStatus.PENDING,
          paymentStatus: PaymentStatus.UNPAID,
          note: createBookingDto.note,
          metadata: createBookingDto.metadata as object | undefined,
          voucherId: voucher?.id,
        },
      });
      if (voucher) {
        await tx.voucher.update({
          where: { id: voucher.id },
          data: { usedCount: { increment: 1 } },
        });
      }
      for (const item of ticketItems) {
        await tx.bookingItem.create({
          data: {
            bookingId: newBooking.id,
            itemType: BookingItemType.SHOW_TICKET,
            ticketId: item.ticketId,
            originalPrice: item.price,
          },
        });
        if (item.physicalSeatId) {
          await tx.ticket.update({
            where: { id: item.ticketId },
            data: { physicalSeatId: item.physicalSeatId },
          });
        }
      }
      for (const item of tourItems) {
        await tx.bookingItem.create({
          data: {
            bookingId: newBooking.id,
            itemType: BookingItemType.TOUR_SLOT,
            tourScheduleId: item.scheduleId,
            quantity: item.quantity,
            originalPrice: item.price,
            passengerInfo: [
              ...(item.passengerInfo || []),
              ...(item.ticketTypeName
                ? [
                    {
                      type: 'TOUR_TICKET_TYPE',
                      name: item.ticketTypeName,
                    },
                  ]
                : []),
            ] as object[] | undefined,
          },
        });
      }
      for (const item of singerPackageItems) {
        await tx.bookingItem.create({
          data: {
            bookingId: newBooking.id,
            itemType: BookingItemType.SINGER_PACKAGE,
            singerPackageId: item.packageId,
            quantity: item.quantity,
            originalPrice: item.price,
          },
        });
      }
      return newBooking;
    });
    this.logger.debug('Transaction completed successfully', { userId, bookingCode });
    await this.cache.del(CacheKeys.userBookings(userId));
    this.logger.log('Booking created successfully', {
      bookingCode: booking.bookingCode,
      userId,
      totalAmount: booking.totalAmount.toString(),
      discountAmount: booking.discountAmount.toString(),
      finalAmount: booking.finalAmount.toString(),
      status: booking.status,
      itemCount: ticketItems.length + tourItems.length + singerPackageItems.length,
    });
    return {
      bookingCode: booking.bookingCode,
      totalAmount: booking.totalAmount,
      discountAmount: booking.discountAmount,
      finalAmount: booking.finalAmount,
      status: booking.status,
      message: 'Đặt hàng thành công. Vui lòng thanh toán để hoàn tất.',
    };
  }
  @LogMethod({ logParams: true, sanitize: true })
  async confirmManualPayment(code: string, userId: number) {
    this.logger.log('Manual payment confirmation requested', {
      bookingCode: code,
      userId,
    });
    const booking = await this.prisma.booking.findFirst({
      where: { bookingCode: code, userId },
    });
    if (!booking) {
      this.logger.warn('Booking not found for manual payment confirmation', {
        bookingCode: code,
        userId,
      });
      throw new NotFoundException({
        code: ERROR_CODES.BOOKING_001,
        message: getErrorMessage(ERROR_CODES.BOOKING_001),
      });
    }
    if (
      booking.status !== BookingStatus.PENDING &&
      booking.status !== BookingStatus.MANUAL_REVIEW
    ) {
      this.logger.warn('Invalid booking status for manual payment confirmation', {
        bookingCode: code,
        userId,
        currentStatus: booking.status,
      });
      throw new BadRequestException('Trạng thái đơn hàng không hợp lệ để xác nhận thanh toán.');
    }
    if (booking.status === BookingStatus.MANUAL_REVIEW) {
      this.logger.debug('Booking already in manual review status', {
        bookingCode: code,
        userId,
        currentPaymentStatus: booking.paymentStatus,
      });
      if (booking.paymentStatus !== PaymentStatus.PAID) {
        this.logger.debug('Updating payment status to PAID for existing MANUAL_REVIEW booking', {
          bookingCode: code,
          userId,
        });
        const updated = await this.prisma.booking.update({
          where: { id: booking.id },
          data: {
            paymentStatus: PaymentStatus.PAID,
          },
        });
        await this.invalidateBookingCache(code, userId);
        return updated;
      }
      return booking;
    }
    this.logger.debug('Updating booking status to MANUAL_REVIEW', {
      bookingCode: code,
      bookingId: booking.id,
      userId,
    });
    const updated = await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.MANUAL_REVIEW,
        paymentStatus: PaymentStatus.PAID,
      },
    });
    await this.invalidateBookingCache(code, userId);
    this.logger.log('Manual payment confirmed successfully', {
      bookingCode: code,
      bookingId: booking.id,
      userId,
      newStatus: updated.status,
      finalAmount: updated.finalAmount.toString(),
    });
    this.logger.debug('Processing commission for collaborator', { bookingId: booking.id });
    try {
      await this.collaboratorService.processCommission(booking.id);
    } catch (error) {
      this.logger.error('Failed to process commission', error.stack, { bookingId: booking.id });
    }
    return updated;
  }
  async findByUserId(userId: number) {
    const cacheKey = CacheKeys.userBookings(userId);
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    const bookings = await this.prisma.booking.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            ticket: { include: { show: true, ticketClass: true } },
            tourSchedule: { include: { tour: true } },
            ticketTier: true,
            singerPackage: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    await this.cache.set(cacheKey, bookings, CACHE_TTL.SHORT);
    return bookings;
  }
  @LogMethod({ logParams: true, sanitize: true })
  async findByCode(code: string, userId?: number) {
    this.logger.debug('Looking up booking by code', { code, userId });
    const cacheKey = CacheKeys.bookingByCode(code);
    if (!userId) {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Booking found in cache', { code });
        return cached;
      }
    }
    this.logger.debug('Fetching booking from database', { code, userId });
    const booking = await this.prisma.booking.findFirst({
      where: {
        bookingCode: code,
        ...(userId && { userId }),
      },
      include: {
        items: {
          include: {
            ticket: { include: { show: true, ticketClass: true, physicalSeat: true } },
            tourSchedule: { include: { tour: true } },
            ticketTier: true,
            singerPackage: true,
          },
        },
        transactions: true,
      },
    });
    if (!booking) {
      this.logger.warn('Booking not found', { code, userId });
      throw new NotFoundException({
        code: ERROR_CODES.BOOKING_001,
        message: getErrorMessage(ERROR_CODES.BOOKING_001),
      });
    }
    this.logger.log('Booking retrieved successfully', {
      code,
      userId: booking.userId,
      status: booking.status,
      finalAmount: booking.finalAmount.toString(),
    });
    await this.cache.set(cacheKey, booking, CACHE_TTL.MEDIUM);
    return booking;
  }
  @LogMethod({ logParams: true, sanitize: true })
  async getBookingDetails(code: string, userId?: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { bookingCode: code },
      include: {
        user: {
          select: {
            fullName: true,
            phoneNumber: true,
            email: true,
          },
        },
        items: {
          include: {
            ticket: {
              include: {
                show: {
                  select: {
                    title: true,
                    performTime: true,
                    description: true,
                    stage: {
                      select: {
                        name: true,
                        address: true,
                      },
                    },
                  },
                },
                ticketClass: {
                  select: {
                    name: true,
                    price: true,
                    colorCode: true,
                  },
                },
              },
            },
            tourSchedule: {
              include: {
                tour: {
                  select: {
                    title: true,
                    description: true,
                    duration: true,
                  },
                },
              },
            },
            ticketTier: {
              select: {
                name: true,
                price: true,
                description: true,
                benefits: true,
                colorCode: true,
              },
            },
            singerPackage: {
              select: {
                name: true,
                price: true,
                description: true,
                benefits: true,
                colorCode: true,
              },
            },
          },
        },
        transactions: {
          where: { status: TransactionStatus.SUCCESS },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            paymentMethod: true,
            payTime: true,
          },
        },
      },
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    if (userId && booking.userId !== userId) {
      throw new NotFoundException('Booking not found');
    }
    const paidTransaction = booking.transactions[0];
    const getItemTypeLabel = (itemType: string) => {
      switch (itemType) {
        case 'SHOW_TICKET':
          return 'Vé xem show';
        case 'TOUR':
          return 'Tour du lịch';
        case 'SINGER_PACKAGE':
          return 'Gói ca sĩ';
        default:
          return itemType;
      }
    };
    const getProductName = (item: (typeof booking.items)[0]) => {
      if (item.ticket?.show) {
        return item.ticket.show.title;
      }
      if (item.tourSchedule?.tour) {
        return item.tourSchedule.tour.title;
      }
      if (item.singerPackage) {
        return item.singerPackage.name;
      }
      return 'Sản phẩm không xác định';
    };
    return {
      id: booking.id,
      bookingCode: booking.bookingCode,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      paymentMethod: paidTransaction?.paymentMethod || 'WALLET',
      subtotalAmount: Number(booking.totalAmount),
      discountAmount: Number(booking.discountAmount),
      finalAmount: Number(booking.finalAmount),
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      paidAt: paidTransaction?.payTime || null,
      confirmedAt:
        booking.status === 'CONFIRMED' || booking.status === 'COMPLETED' ? booking.updatedAt : null,
      user: booking.user,
      items: booking.items.map((item) => ({
        id: item.id,
        itemType: item.itemType,
        itemTypeLabel: getItemTypeLabel(item.itemType),
        productName: getProductName(item),
        itemId: item.ticketId || item.tourScheduleId || null,
        quantity: item.quantity,
        unitPrice: Number(item.originalPrice),
        subtotal: Number(item.originalPrice) * item.quantity,
        show: item.ticket?.show
          ? {
              title: item.ticket.show.title,
              description: item.ticket.show.description,
              thumbnailUrl: null,
              startDate: item.ticket.show.performTime,
              stage: item.ticket.show.stage,
            }
          : null,
        tour: item.tourSchedule?.tour
          ? {
              title: item.tourSchedule.tour.title,
              description: item.tourSchedule.tour.description,
              duration: item.tourSchedule.tour.duration,
              thumbnailUrl: null,
              departureDate: item.tourSchedule.startDate,
            }
          : null,
        singerPackage: item.singerPackage
          ? {
              name: item.singerPackage.name,
              price: Number(item.singerPackage.price),
              description: item.singerPackage.description,
              benefits: item.singerPackage.benefits,
              colorCode: item.singerPackage.colorCode,
            }
          : null,
        ticketClass: item.ticket?.ticketClass
          ? {
              name: item.ticket.ticketClass.name,
              price: Number(item.ticket.ticketClass.price),
              colorCode: item.ticket.ticketClass.colorCode,
            }
          : null,
        ticketTier: item.ticketTier
          ? {
              name: item.ticketTier.name,
              price: Number(item.ticketTier.price),
              description: item.ticketTier.description,
              benefits: item.ticketTier.benefits,
              colorCode: item.ticketTier.colorCode,
            }
          : null,
      })),
    };
  }
  @LogMethod({ logParams: true, sanitize: true })
  async cancel(bookingId: number, userId: number) {
    this.logger.log('Cancelling booking', { bookingId, userId });
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, userId },
    });
    if (!booking) {
      this.logger.warn('Booking not found for cancellation', { bookingId, userId });
      throw new NotFoundException({
        code: ERROR_CODES.BOOKING_001,
        message: getErrorMessage(ERROR_CODES.BOOKING_001),
      });
    }
    if (booking.status === BookingStatus.CANCELLED) {
      this.logger.warn('Booking already cancelled', {
        bookingId,
        bookingCode: booking.bookingCode,
        userId,
      });
      throw new BadRequestException({
        code: ERROR_CODES.BOOKING_002,
        message: getErrorMessage(ERROR_CODES.BOOKING_002),
      });
    }
    if (booking.paymentStatus === PaymentStatus.PAID) {
      this.logger.warn('Cannot cancel paid booking', {
        bookingId,
        bookingCode: booking.bookingCode,
        paymentStatus: booking.paymentStatus,
        userId,
      });
      throw new BadRequestException({
        code: ERROR_CODES.BOOKING_003,
        message: getErrorMessage(ERROR_CODES.BOOKING_003),
      });
    }
    this.logger.debug('Releasing locked tickets', { bookingId });
    const ticketItems = await this.prisma.bookingItem.findMany({
      where: { bookingId, itemType: BookingItemType.SHOW_TICKET },
    });
    for (const item of ticketItems) {
      if (item.ticketId) {
        await this.ticketsService.releaseTicket(userId, item.ticketId);
      }
    }
    this.logger.debug('Released tickets', { bookingId, ticketCount: ticketItems.length });
    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED },
    });
    await this.invalidateBookingCache(booking.bookingCode, userId);
    this.logger.log('Booking cancelled successfully', {
      bookingCode: booking.bookingCode,
      bookingId,
      userId,
      releasedTickets: ticketItems.length,
    });
    return { message: 'Đã hủy đơn hàng thành công.' };
  }
  async invalidateBookingCache(bookingCode: string, userId: number) {
    await this.cache.delMany([
      CacheKeys.bookingByCode(bookingCode),
      CacheKeys.userBookings(userId),
      `${CacheKeys.userBookings(userId)}:shows`,
      `${CacheKeys.userBookings(userId)}:singer`,
    ]);
  }
  private generateBookingCode(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BK${timestamp}${random}`;
  }
}
