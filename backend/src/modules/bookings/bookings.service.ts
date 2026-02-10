import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { BookingStatus, PaymentStatus, BookingItemType } from '@prisma/client';
import { CreateBookingDto } from './dto/create-booking.dto';
import { TicketsService } from '../tickets/tickets.service';
import { ToursService } from '../tours/tours.service';
import { ERROR_CODES, getErrorMessage } from '@/common/constants/error-codes.constant';
import { Decimal } from '@prisma/client/runtime/library';
import { CacheService } from '@/cache/cache.service';
import { CacheKeys, CACHE_TTL } from '@/cache/cache-keys.constant';
import { EnhancedLoggerService } from '@/common/services/enhanced-logger.service';
import { LogMethod } from '@/common/decorators/log-method.decorator';

@Injectable()
export class BookingsService {
  private readonly logger: EnhancedLoggerService;

  constructor(
    private readonly prisma: PrismaService,
    private readonly ticketsService: TicketsService,
    private readonly toursService: ToursService,
    private readonly cache: CacheService,
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
      ticketTiersCount: createBookingDto.ticketTiers?.length ?? 0,
      tourItemsCount: createBookingDto.tourItems?.length ?? 0,
      singerPackagesCount: createBookingDto.singerPackages?.length ?? 0,
    });

    const hasTickets =
      (createBookingDto.ticketsWithSeats?.length ?? 0) > 0 ||
      (createBookingDto.ticketIds?.length ?? 0) > 0;
    const hasTiers = (createBookingDto.ticketTiers?.length ?? 0) > 0;
    const hasTours = (createBookingDto.tourItems?.length ?? 0) > 0;
    const hasSingerPackages = (createBookingDto.singerPackages?.length ?? 0) > 0;
    if (!hasTickets && !hasTiers && !hasTours && !hasSingerPackages) {
      this.logger.warn('Booking validation failed - no items provided', { userId });
      throw new BadRequestException({
        code: ERROR_CODES.VAL_001,
        message:
          'Đơn hàng phải có ít nhất một mục: vé (ticketsWithSeats/ticketIds), loại vé (ticketTiers), tour (tourItems), hoặc gói ca sĩ (singerPackages).',
      });
    }

    const bookingCode = this.generateBookingCode();
    this.logger.debug('Generated booking code', { bookingCode, userId });
    let totalAmount = new Decimal(0);

    // Validate and calculate ticket prices (new flow with seats)
    const ticketItems: { ticketId: number; price: Decimal; physicalSeatId?: number }[] = [];

    // Handle new flow: ticketsWithSeats (includes seat selection)
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

      // Validate and assign seats
      for (const ticketWithSeat of createBookingDto.ticketsWithSeats) {
        const ticket = tickets.find((t) => t.id === ticketWithSeat.ticketId);
        if (!ticket) continue;

        // If seat selection is enabled and seat is provided, validate it
        if (ticket.show?.seatSelectionEnabled && ticketWithSeat.physicalSeatId) {
          // Check if seat exists and belongs to the stage
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

          // Check if seat is already taken for this show
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
    }
    // Handle old flow: simple ticketIds (backward compatibility)
    else if (createBookingDto.ticketIds?.length) {
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

    // Validate and calculate tour prices
    const tourItems: { scheduleId: number; quantity: number; price: Decimal }[] = [];
    if (createBookingDto.tourItems?.length) {
      for (const item of createBookingDto.tourItems) {
        await this.toursService.checkScheduleAvailability(item.scheduleId, item.quantity);
        const schedule = await this.prisma.tourSchedule.findUnique({
          where: { id: item.scheduleId },
        });
        if (schedule) {
          const itemTotal = schedule.price.mul(item.quantity);
          tourItems.push({
            scheduleId: item.scheduleId,
            quantity: item.quantity,
            price: schedule.price,
          });
          totalAmount = totalAmount.plus(itemTotal);
        }
      }
    }

    // Validate and calculate ticket tiers (Open Ticket Flow)
    const tierItems: { tierId: number; quantity: number; price: Decimal }[] = [];
    if (createBookingDto.ticketTiers?.length) {
      const tierIds = createBookingDto.ticketTiers.map((t) => t.tierId);
      const tiers = await this.prisma.ticketTier.findMany({
        where: { id: { in: tierIds }, isActive: true },
      });

      if (tiers.length !== tierIds.length) {
        throw new BadRequestException({
          code: ERROR_CODES.TICKET_001,
          message: 'Một số loại vé không tồn tại hoặc ngừng hoạt động.',
        });
      }

      for (const item of createBookingDto.ticketTiers) {
        const tier = tiers.find((t) => t.id === item.tierId);
        if (tier) {
          const itemTotal = tier.price.mul(item.quantity);
          tierItems.push({
            tierId: item.tierId,
            quantity: item.quantity,
            price: tier.price,
          });
          totalAmount = totalAmount.plus(itemTotal);
        }
      }
    }

    // Validate and calculate singer packages
    const singerPackageItems: { packageId: string; quantity: number; price: Decimal }[] = [];
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

    // Calculate discount
    let discountAmount = new Decimal(0);
    if (createBookingDto.voucherCode) {
      const voucher = await this.prisma.voucher.findFirst({
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

    // Create booking with items and assign seats
    this.logger.debug('Starting database transaction for booking creation', { userId, bookingCode });
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
        },
      });

      // Create ticket booking items and assign seats
      for (const item of ticketItems) {
        await tx.bookingItem.create({
          data: {
            bookingId: newBooking.id,
            itemType: BookingItemType.SHOW_TICKET,
            ticketId: item.ticketId,
            originalPrice: item.price,
          },
        });

        // Update ticket with physical seat if provided
        if (item.physicalSeatId) {
          await tx.ticket.update({
            where: { id: item.ticketId },
            data: { physicalSeatId: item.physicalSeatId },
          });
        }
      }

      // Create tour booking items
      for (const item of tourItems) {
        await tx.bookingItem.create({
          data: {
            bookingId: newBooking.id,
            itemType: BookingItemType.TOUR_SLOT,
            tourScheduleId: item.scheduleId,
            quantity: item.quantity,
            originalPrice: item.price,
            passengerInfo: createBookingDto.tourItems?.find((t) => t.scheduleId === item.scheduleId)
              ?.passengerInfo as object[] | undefined,
          },
        });
      }

      // Create ticket tier booking items
      for (const item of tierItems) {
        await tx.bookingItem.create({
          data: {
            bookingId: newBooking.id,
            itemType: BookingItemType.SHOW_TICKET, // Or reusing SHOW_TICKET type, but with null ticketId
            ticketTierId: item.tierId,
            quantity: item.quantity,
            originalPrice: item.price,
          },
        });
      }

      // Create singer package booking items
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

    // Invalidate user bookings cache
    await this.cache.del(CacheKeys.userBookings(userId));

    this.logger.log('Booking created successfully', {
      bookingCode: booking.bookingCode,
      userId,
      totalAmount: booking.totalAmount.toString(),
      discountAmount: booking.discountAmount.toString(),
      finalAmount: booking.finalAmount.toString(),
      status: booking.status,
      itemCount: ticketItems.length + tourItems.length + tierItems.length + singerPackageItems.length,
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

    // Allow confirming if Pending or if already Manual Review (idempotent)
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

    // Idempotent - already confirmed
    if (booking.status === BookingStatus.MANUAL_REVIEW) {
      this.logger.debug('Booking already in manual review status', {
        bookingCode: code,
        userId,
      });
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

    return updated;
  }

  async findByUserId(userId: number) {
    const cacheKey = CacheKeys.userBookings(userId);

    // Try cache first
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

    // Cache for 5 minutes
    await this.cache.set(cacheKey, bookings, CACHE_TTL.SHORT);

    return bookings;
  }

  @LogMethod({ logParams: true, sanitize: true })
  async findByCode(code: string, userId?: number) {
    this.logger.debug('Looking up booking by code', { code, userId });

    const cacheKey = CacheKeys.bookingByCode(code);

    // Try cache first (only for read without userId filter)
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

    // Cache booking for 10 minutes
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
            show: {
              include: {
                stage: {
                  select: {
                    name: true,
                    address: true,
                  },
                },
              },
            },
            tour: {
              select: {
                title: true,
                thumbnailUrl: true,
                departureDate: true,
              },
            },
            singerPackage: {
              select: {
                name: true,
                description: true,
              },
            },
            ticketClass: {
              select: {
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // If userId is provided, verify ownership
    if (userId && booking.userId !== userId) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
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

    // Release locked tickets
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

    // Invalidate caches
    await this.invalidateBookingCache(booking.bookingCode, userId);

    this.logger.log('Booking cancelled successfully', {
      bookingCode: booking.bookingCode,
      bookingId,
      userId,
      releasedTickets: ticketItems.length,
    });

    return { message: 'Đã hủy đơn hàng thành công.' };
  }

  /**
   * Invalidate booking-related caches
   */
  async invalidateBookingCache(bookingCode: string, userId: number) {
    await this.cache.delMany([
      CacheKeys.bookingByCode(bookingCode),
      CacheKeys.userBookings(userId),
    ]);
  }

  private generateBookingCode(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BK${timestamp}${random}`;
  }
}
