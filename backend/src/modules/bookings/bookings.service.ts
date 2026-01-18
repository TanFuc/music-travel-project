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

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ticketsService: TicketsService,
    private readonly toursService: ToursService,
    private readonly cache: CacheService,
  ) {}

  async create(userId: number, createBookingDto: CreateBookingDto) {
    const bookingCode = this.generateBookingCode();
    let totalAmount = new Decimal(0);

    // Validate and calculate ticket prices (new flow with seats)
    const ticketItems: { ticketId: number; price: Decimal; physicalSeatId?: number }[] = [];
    
    // Handle new flow: ticketsWithSeats (includes seat selection)
    if (createBookingDto.ticketsWithSeats?.length) {
      const ticketIds = createBookingDto.ticketsWithSeats.map(t => t.ticketId);
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
        const ticket = tickets.find(t => t.id === ticketWithSeat.ticketId);
        if (!ticket) continue;

        // If seat selection is enabled and seat is provided, validate it
        if (ticket.show.seatSelectionEnabled && ticketWithSeat.physicalSeatId) {
          // Check if seat exists and belongs to the stage
          const seat = await this.prisma.physicalSeat.findFirst({
            where: {
              id: ticketWithSeat.physicalSeatId,
              stageId: ticket.show.stageId,
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
          price: ticket.ticketClass.price,
          physicalSeatId: ticketWithSeat.physicalSeatId 
        });
        totalAmount = totalAmount.plus(ticket.ticketClass.price);
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
        ticketItems.push({ ticketId: ticket.id, price: ticket.ticketClass.price });
        totalAmount = totalAmount.plus(ticket.ticketClass.price);
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

    // Create booking with items and assign seats
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

      return newBooking;
    });

    // Invalidate user bookings cache
    await this.cache.del(CacheKeys.userBookings(userId));

    this.logger.log(`Booking ${booking.bookingCode} created for user ${userId}`);

    return {
      bookingCode: booking.bookingCode,
      totalAmount: booking.totalAmount,
      discountAmount: booking.discountAmount,
      finalAmount: booking.finalAmount,
      status: booking.status,
      message: 'Đặt hàng thành công. Vui lòng thanh toán để hoàn tất.',
    };
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
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Cache for 5 minutes
    await this.cache.set(cacheKey, bookings, CACHE_TTL.SHORT);

    return bookings;
  }

  async findByCode(code: string, userId?: number) {
    const cacheKey = CacheKeys.bookingByCode(code);

    // Try cache first (only for read without userId filter)
    if (!userId) {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

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
          },
        },
        transactions: true,
      },
    });

    if (!booking) {
      throw new NotFoundException({
        code: ERROR_CODES.BOOKING_001,
        message: getErrorMessage(ERROR_CODES.BOOKING_001),
      });
    }

    // Cache booking for 10 minutes
    await this.cache.set(cacheKey, booking, CACHE_TTL.MEDIUM);

    return booking;
  }

  async cancel(bookingId: number, userId: number) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, userId },
    });

    if (!booking) {
      throw new NotFoundException({
        code: ERROR_CODES.BOOKING_001,
        message: getErrorMessage(ERROR_CODES.BOOKING_001),
      });
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException({
        code: ERROR_CODES.BOOKING_002,
        message: getErrorMessage(ERROR_CODES.BOOKING_002),
      });
    }

    if (booking.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException({
        code: ERROR_CODES.BOOKING_003,
        message: getErrorMessage(ERROR_CODES.BOOKING_003),
      });
    }

    // Release locked tickets
    const ticketItems = await this.prisma.bookingItem.findMany({
      where: { bookingId, itemType: BookingItemType.SHOW_TICKET },
    });

    for (const item of ticketItems) {
      if (item.ticketId) {
        await this.ticketsService.releaseTicket(userId, item.ticketId);
      }
    }

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED },
    });

    // Invalidate caches
    await this.invalidateBookingCache(booking.bookingCode, userId);

    this.logger.log(`Booking ${booking.bookingCode} cancelled by user ${userId}`);

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
