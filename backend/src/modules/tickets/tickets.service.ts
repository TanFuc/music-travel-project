import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { TicketStatus } from '@prisma/client';
import { LockTicketsDto } from './dto/lock-tickets.dto';
import { ERROR_CODES, getErrorMessage } from '@/common/constants/error-codes.constant';
import { CacheService } from '@/cache/cache.service';
import { CacheKeys, CachePatterns, CACHE_TTL } from '@/cache/cache-keys.constant';
import { v4 as uuidv4 } from 'uuid';

const LOCK_TTL_MINUTES = 10; // Ticket lock expires after 10 minutes

interface TicketLockData {
  userId: number;
  ticketIds: number[];
  showId: number;
  totalPrice: number;
  lockedAt: string;
  expiresAt: string;
}

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  /**
   * Lock tickets for a user with Redis-backed lock management
   */
  async lockTickets(userId: number, lockTicketsDto: LockTicketsDto) {
    const { ticketIds } = lockTicketsDto;

    // First, release any expired locks
    await this.releaseExpiredLocks();

    // Check all tickets are available
    const tickets = await this.prisma.ticket.findMany({
      where: {
        id: { in: ticketIds },
      },
      include: {
        show: true,
        ticketClass: true,
      },
    });

    if (tickets.length !== ticketIds.length) {
      throw new NotFoundException({
        code: ERROR_CODES.TICKET_001,
        message: 'Một số vé không tồn tại.',
      });
    }

    // Check show status
    const showStatuses = new Set(tickets.map((t) => t.show.status));
    if (showStatuses.has('ENDED') || showStatuses.has('CANCELLED')) {
      throw new BadRequestException({
        code: ERROR_CODES.SHOW_002,
        message: getErrorMessage(ERROR_CODES.SHOW_002),
      });
    }

    // Check availability
    const unavailableTickets = tickets.filter(
      (t) => t.status !== TicketStatus.AVAILABLE || (t.lockedAt && !this.isLockExpired(t.lockedAt)),
    );

    if (unavailableTickets.length > 0) {
      throw new BadRequestException({
        code: ERROR_CODES.TICKET_001,
        message: getErrorMessage(ERROR_CODES.TICKET_001),
      });
    }

    // Generate unique lock ID
    const lockId = uuidv4();
    const lockTime = new Date();
    const expiresAt = new Date(lockTime.getTime() + LOCK_TTL_MINUTES * 60 * 1000);
    const showId = tickets[0].showId;

    // Calculate total price
    const totalPrice = tickets.reduce((sum, t) => sum + Number(t.ticketClass.price), 0);

    // Store lock data in Redis for fast retrieval and expiration
    const lockData: TicketLockData = {
      userId,
      ticketIds,
      showId,
      totalPrice,
      lockedAt: lockTime.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    // Use Redis to track the lock with automatic expiration
    const lockCacheKey = CacheKeys.ticketLock(lockId);
    await this.cache.set(lockCacheKey, lockData, CACHE_TTL.TICKET_LOCK);

    // Lock all tickets atomically in database
    await this.prisma.$transaction(async (tx) => {
      await tx.ticket.updateMany({
        where: {
          id: { in: ticketIds },
          status: TicketStatus.AVAILABLE,
        },
        data: {
          status: TicketStatus.LOCKED,
          lockedAt: lockTime,
          holderUserId: userId,
        },
      });
    });

    // Invalidate seat map cache for this show
    await this.invalidateShowTicketCache(showId);

    this.logger.log(`User ${userId} locked ${ticketIds.length} tickets. Lock ID: ${lockId}`);

    return {
      lockId,
      lockedTickets: ticketIds,
      expiresAt,
      totalPrice,
      message: `Đã giữ ${ticketIds.length} vé. Vui lòng thanh toán trong ${LOCK_TTL_MINUTES} phút.`,
    };
  }

  /**
   * Get lock information by lock ID
   */
  async getLockInfo(lockId: string): Promise<TicketLockData | null> {
    const cacheKey = CacheKeys.ticketLock(lockId);
    return this.cache.get<TicketLockData>(cacheKey);
  }

  /**
   * Verify and extend lock if valid
   */
  async verifyLock(lockId: string, userId: number): Promise<TicketLockData> {
    const lockData = await this.getLockInfo(lockId);

    if (!lockData) {
      throw new BadRequestException({
        code: ERROR_CODES.TICKET_002,
        message: getErrorMessage(ERROR_CODES.TICKET_002),
      });
    }

    if (lockData.userId !== userId) {
      throw new BadRequestException({
        code: ERROR_CODES.TICKET_001,
        message: 'Bạn không có quyền truy cập vé này.',
      });
    }

    return lockData;
  }

  /**
   * Release a specific ticket lock
   */
  async releaseTicket(userId: number, ticketId: number) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException({
        code: ERROR_CODES.TICKET_001,
        message: 'Vé không tồn tại.',
      });
    }

    if (ticket.holderUserId !== userId) {
      throw new BadRequestException({
        code: ERROR_CODES.TICKET_001,
        message: 'Bạn không có quyền hủy giữ vé này.',
      });
    }

    if (ticket.status !== TicketStatus.LOCKED) {
      throw new BadRequestException({
        code: ERROR_CODES.TICKET_001,
        message: 'Vé không trong trạng thái đang giữ.',
      });
    }

    await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: TicketStatus.AVAILABLE,
        lockedAt: null,
        holderUserId: null,
      },
    });

    // Invalidate cache
    await this.invalidateShowTicketCache(ticket.showId);

    return { message: 'Đã hủy giữ vé thành công.' };
  }

  /**
   * Release all tickets in a lock by lock ID
   */
  async releaseLockById(lockId: string, userId: number) {
    const lockData = await this.verifyLock(lockId, userId);

    await this.prisma.ticket.updateMany({
      where: {
        id: { in: lockData.ticketIds },
        status: TicketStatus.LOCKED,
        holderUserId: userId,
      },
      data: {
        status: TicketStatus.AVAILABLE,
        lockedAt: null,
        holderUserId: null,
      },
    });

    // Delete lock from Redis
    const cacheKey = CacheKeys.ticketLock(lockId);
    await this.cache.del(cacheKey);

    // Invalidate cache
    await this.invalidateShowTicketCache(lockData.showId);

    this.logger.log(`Released lock ${lockId} for user ${userId}`);

    return {
      releasedCount: lockData.ticketIds.length,
      message: `Đã hủy giữ ${lockData.ticketIds.length} vé.`,
    };
  }

  /**
   * Release all locked tickets for a user
   */
  async releaseAllUserTickets(userId: number) {
    const lockedTickets = await this.prisma.ticket.findMany({
      where: {
        holderUserId: userId,
        status: TicketStatus.LOCKED,
      },
      select: { showId: true },
    });

    const showIds = [...new Set(lockedTickets.map((t) => t.showId))];

    const result = await this.prisma.ticket.updateMany({
      where: {
        holderUserId: userId,
        status: TicketStatus.LOCKED,
      },
      data: {
        status: TicketStatus.AVAILABLE,
        lockedAt: null,
        holderUserId: null,
      },
    });

    // Invalidate caches for all affected shows
    for (const showId of showIds) {
      await this.invalidateShowTicketCache(showId);
    }

    return {
      releasedCount: result.count,
      message: `Đã hủy giữ ${result.count} vé.`,
    };
  }

  /**
   * Release expired locks (cleanup job)
   */
  async releaseExpiredLocks() {
    const expirationTime = new Date(Date.now() - LOCK_TTL_MINUTES * 60 * 1000);

    const expiredTickets = await this.prisma.ticket.findMany({
      where: {
        status: TicketStatus.LOCKED,
        lockedAt: { lt: expirationTime },
      },
      select: { showId: true },
    });

    const showIds = [...new Set(expiredTickets.map((t) => t.showId))];

    const result = await this.prisma.ticket.updateMany({
      where: {
        status: TicketStatus.LOCKED,
        lockedAt: { lt: expirationTime },
      },
      data: {
        status: TicketStatus.AVAILABLE,
        lockedAt: null,
        holderUserId: null,
      },
    });

    if (result.count > 0) {
      this.logger.log(`Released ${result.count} expired ticket locks`);

      // Invalidate caches for all affected shows
      for (const showId of showIds) {
        await this.invalidateShowTicketCache(showId);
      }
    }

    return result.count;
  }

  /**
   * Mark tickets as sold after successful payment
   */
  async markTicketsAsSold(ticketIds: number[], bookingId: number) {
    const tickets = await this.prisma.ticket.findMany({
      where: { id: { in: ticketIds } },
      select: { showId: true },
    });

    const showIds = [...new Set(tickets.map((t) => t.showId))];

    await this.prisma.ticket.updateMany({
      where: {
        id: { in: ticketIds },
      },
      data: {
        status: TicketStatus.SOLD,
        bookingId,
        lockedAt: null,
      },
    });

    // Invalidate caches for all affected shows
    for (const showId of showIds) {
      await this.invalidateShowTicketCache(showId);
    }

    this.logger.log(`Marked ${ticketIds.length} tickets as SOLD for booking ${bookingId}`);
  }

  /**
   * Get available tickets for a show
   */
  async getAvailableTickets(showId: number, ticketClassId?: number) {
    const cacheKey = ticketClassId
      ? CacheKeys.availableTickets(showId, ticketClassId)
      : CacheKeys.ticketsByShow(showId);

    // Short TTL for available tickets as it's highly volatile
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const tickets = await this.prisma.ticket.findMany({
      where: {
        showId,
        status: TicketStatus.AVAILABLE,
        ...(ticketClassId && { ticketClassId }),
      },
      include: {
        ticketClass: true,
        physicalSeat: true,
      },
    });

    // Cache for 1 minute only
    await this.cache.set(cacheKey, tickets, CACHE_TTL.VERY_SHORT);

    return tickets;
  }

  /**
   * Invalidate ticket-related caches for a show
   */
  private async invalidateShowTicketCache(showId: number) {
    await this.cache.delPattern(`${CacheKeys.ticketsByShow(showId).replace(':' + showId, '')}*${showId}*`);
    await this.cache.del(CacheKeys.showSeatMap(showId));
    await this.cache.del(CacheKeys.showTicketClasses(showId));
    // Also invalidate show lists as ticket availability affects them
    await this.cache.delPattern(CachePatterns.showLists());
  }

  private isLockExpired(lockedAt: Date): boolean {
    const expirationTime = new Date(lockedAt.getTime() + LOCK_TTL_MINUTES * 60 * 1000);
    return new Date() > expirationTime;
  }
}
