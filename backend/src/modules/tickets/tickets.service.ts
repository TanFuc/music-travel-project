import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { TicketStatus } from '@prisma/client';
import { LockTicketsDto } from './dto/lock-tickets.dto';
import { CheckInDto } from './dto/check-in.dto';
import { ERROR_CODES, getErrorMessage } from '@/common/constants/error-codes.constant';
import { CacheService } from '@/cache/cache.service';
import { CacheKeys, CachePatterns, CACHE_TTL } from '@/cache/cache-keys.constant';
import { v4 as uuidv4 } from 'uuid';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';
import { EnhancedLoggerService } from '@/common/services/enhanced-logger.service';
import { LogMethod } from '@/common/decorators/log-method.decorator';
const LOCK_TTL_MINUTES = 10;
const QR_PREFIX = 'MTICKET:';
interface TicketLockData {
  userId: number;
  ticketIds: number[];
  showId: number | null;
  totalPrice: number;
  lockedAt: string;
  expiresAt: string;
}
interface QRPayload {
  tc: string;
  bk: string;
  sh: number | null;
  iat: number;
}
export interface CheckInResult {
  success: boolean;
  ticketId: number;
  ticketCode: string;
  showTitle: string;
  seatInfo: string | null;
  checkedInAt: Date;
  message: string;
}
@Injectable()
export class TicketsService {
  private readonly logger: EnhancedLoggerService;
  private readonly qrSecret: string;
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly configService: ConfigService,
    private readonly enhancedLoggerService: EnhancedLoggerService,
  ) {
    this.logger = this.enhancedLoggerService.createChild(TicketsService.name);
    this.qrSecret =
      this.configService.get<string>('QR_SECRET') || 'default-qr-secret-change-in-production';
  }
  @LogMethod({ logParams: true, sanitize: true })
  async lockTickets(userId: number, lockTicketsDto: LockTicketsDto) {
    const { ticketIds } = lockTicketsDto;
    this.logger.log('Locking tickets', { userId, ticketCount: ticketIds.length });
    await this.releaseExpiredLocks();
    this.logger.debug('Fetching tickets for locking', { ticketIds });
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
      this.logger.warn('Some tickets not found', {
        userId,
        requestedCount: ticketIds.length,
        foundCount: tickets.length,
      });
      throw new NotFoundException({
        code: ERROR_CODES.TICKET_001,
        message: 'Một số vé không tồn tại.',
      });
    }
    const showStatuses = new Set(tickets.map((t) => t.show?.status).filter(Boolean));
    if (showStatuses.has('ENDED') || showStatuses.has('CANCELLED')) {
      throw new BadRequestException({
        code: ERROR_CODES.SHOW_002,
        message: getErrorMessage(ERROR_CODES.SHOW_002),
      });
    }
    const unavailableTickets = tickets.filter(
      (t) => t.status !== TicketStatus.AVAILABLE || (t.lockedAt && !this.isLockExpired(t.lockedAt)),
    );
    if (unavailableTickets.length > 0) {
      throw new BadRequestException({
        code: ERROR_CODES.TICKET_001,
        message: getErrorMessage(ERROR_CODES.TICKET_001),
      });
    }
    const lockId = uuidv4();
    const lockTime = new Date();
    const expiresAt = new Date(lockTime.getTime() + LOCK_TTL_MINUTES * 60 * 1000);
    const showId = tickets[0]?.showId || null;
    const totalPrice = tickets.reduce((sum, t) => sum + Number(t.ticketClass?.price || 0), 0);
    const lockData: TicketLockData = {
      userId,
      ticketIds,
      showId,
      totalPrice,
      lockedAt: lockTime.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
    const lockCacheKey = CacheKeys.ticketLock(lockId);
    await this.cache.set(lockCacheKey, lockData, CACHE_TTL.TICKET_LOCK);
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
    if (showId) {
      await this.invalidateShowTicketCache(showId);
    }
    this.logger.log(`User ${userId} locked ${ticketIds.length} tickets. Lock ID: ${lockId}`);
    return {
      lockId,
      lockedTickets: ticketIds,
      expiresAt,
      totalPrice,
      message: `Đã giữ ${ticketIds.length} vé. Vui lòng thanh toán trong ${LOCK_TTL_MINUTES} phút.`,
    };
  }
  async getLockInfo(lockId: string): Promise<TicketLockData | null> {
    const cacheKey = CacheKeys.ticketLock(lockId);
    return this.cache.get<TicketLockData>(cacheKey);
  }
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
    if (ticket.showId) {
      await this.invalidateShowTicketCache(ticket.showId);
    }
    return { message: 'Đã hủy giữ vé thành công.' };
  }
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
    const cacheKey = CacheKeys.ticketLock(lockId);
    await this.cache.del(cacheKey);
    if (lockData.showId) {
      await this.invalidateShowTicketCache(lockData.showId);
    }
    this.logger.log(`Released lock ${lockId} for user ${userId}`);
    return {
      releasedCount: lockData.ticketIds.length,
      message: `Đã hủy giữ ${lockData.ticketIds.length} vé.`,
    };
  }
  async releaseAllUserTickets(userId: number) {
    const lockedTickets = await this.prisma.ticket.findMany({
      where: {
        holderUserId: userId,
        status: TicketStatus.LOCKED,
      },
      select: { showId: true },
    });
    const showIds = [
      ...new Set(lockedTickets.map((t) => t.showId).filter((id): id is number => id !== null)),
    ];
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
    for (const showId of showIds) {
      await this.invalidateShowTicketCache(showId);
    }
    return {
      releasedCount: result.count,
      message: `Đã hủy giữ ${result.count} vé.`,
    };
  }
  async releaseExpiredLocks() {
    const expirationTime = new Date(Date.now() - LOCK_TTL_MINUTES * 60 * 1000);
    const expiredTickets = await this.prisma.ticket.findMany({
      where: {
        status: TicketStatus.LOCKED,
        lockedAt: { lt: expirationTime },
      },
      select: { showId: true },
    });
    const showIds = [
      ...new Set(expiredTickets.map((t) => t.showId).filter((id): id is number => id !== null)),
    ];
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
      for (const showId of showIds) {
        await this.invalidateShowTicketCache(showId);
      }
    }
    return result.count;
  }
  async markTicketsAsSold(ticketIds: number[], bookingId: number) {
    const tickets = await this.prisma.ticket.findMany({
      where: { id: { in: ticketIds } },
      select: { showId: true },
    });
    const showIds = [
      ...new Set(tickets.map((t) => t.showId).filter((id): id is number => id !== null)),
    ];
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
    for (const showId of showIds) {
      await this.invalidateShowTicketCache(showId);
    }
    this.logger.log(`Marked ${ticketIds.length} tickets as SOLD for booking ${bookingId}`);
  }
  async getAvailableTickets(showId: number, ticketClassId?: number) {
    const cacheKey = ticketClassId
      ? CacheKeys.availableTickets(showId, ticketClassId)
      : CacheKeys.ticketsByShow(showId);
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
    await this.cache.set(cacheKey, tickets, CACHE_TTL.VERY_SHORT);
    return tickets;
  }
  private async invalidateShowTicketCache(showId: number) {
    await this.cache.delPattern(
      `${CacheKeys.ticketsByShow(showId).replace(':' + showId, '')}*${showId}*`,
    );
    await this.cache.del(CacheKeys.showSeatMap(showId));
    await this.cache.del(CacheKeys.showTicketClasses(showId));
    await this.cache.delPattern(CachePatterns.showLists());
  }
  private isLockExpired(lockedAt: Date): boolean {
    const expirationTime = new Date(lockedAt.getTime() + LOCK_TTL_MINUTES * 60 * 1000);
    return new Date() > expirationTime;
  }
  async getTicketsByBooking(bookingId: number) {
    const tickets = await this.prisma.ticket.findMany({
      where: { bookingId },
      include: {
        show: {
          select: {
            id: true,
            title: true,
            performTime: true,
            checkInTime: true,
            status: true,
            stage: {
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
          },
        },
        ticketClass: {
          select: {
            id: true,
            name: true,
            price: true,
            colorCode: true,
          },
        },
        ticketTier: {
          select: {
            id: true,
            name: true,
            price: true,
            colorCode: true,
            description: true,
          },
        },
        physicalSeat: {
          select: {
            id: true,
            zoneName: true,
            rowName: true,
            seatNumber: true,
            type: true,
          },
        },
      },
    });
    return tickets.map((ticket) => ({
      id: ticket.id,
      ticketCode: ticket.ticketCode,
      status: ticket.status,
      isCheckedIn: ticket.isCheckedIn,
      checkedInAt: ticket.checkedInAt,
      show: ticket.show,
      ticketClass: ticket.ticketClass,
      ticketTier: ticket.ticketTier,
      seat: ticket.physicalSeat
        ? {
            zone: ticket.physicalSeat.zoneName,
            row: ticket.physicalSeat.rowName,
            number: ticket.physicalSeat.seatNumber,
            type: ticket.physicalSeat.type,
          }
        : null,
    }));
  }
  async getTicketQRBatch(
    bookingId: number,
    userId: number,
  ): Promise<
    Array<{
      ticketId: number;
      ticketCode: string;
      qrDataUrl: string;
      seatInfo: string | null;
    }>
  > {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) {
      throw new NotFoundException({
        code: ERROR_CODES.BOOKING_001,
        message: getErrorMessage(ERROR_CODES.BOOKING_001),
      });
    }
    if (booking.userId !== userId) {
      throw new BadRequestException({
        code: ERROR_CODES.AUTH_003,
        message: getErrorMessage(ERROR_CODES.AUTH_003),
      });
    }
    const tickets = await this.prisma.ticket.findMany({
      where: {
        bookingId,
        status: TicketStatus.SOLD,
      },
      include: {
        physicalSeat: true,
      },
    });
    if (tickets.length === 0) {
      throw new BadRequestException({
        code: ERROR_CODES.TICKET_001,
        message: 'Không có vé nào để tạo QR code.',
      });
    }
    const qrResults = await Promise.all(
      tickets.map(async (ticket) => {
        if (!ticket.ticketCode) {
          return null;
        }
        const payload: QRPayload = {
          tc: ticket.ticketCode,
          bk: booking.bookingCode,
          sh: ticket.showId,
          iat: Math.floor(Date.now() / 1000),
        };
        const qrString = this.createSignedQRString(payload);
        const qrDataUrl = await QRCode.toDataURL(qrString, {
          errorCorrectionLevel: 'M',
          type: 'image/png',
          width: 300,
          margin: 2,
        });
        let seatInfo: string | null = null;
        if (ticket.physicalSeat) {
          const seat = ticket.physicalSeat;
          seatInfo = `${seat.zoneName} - Hàng ${seat.rowName} - Ghế ${seat.seatNumber}`;
        }
        return {
          ticketId: ticket.id,
          ticketCode: ticket.ticketCode,
          qrDataUrl,
          seatInfo,
        };
      }),
    );
    return qrResults.filter((r): r is NonNullable<typeof r> => r !== null);
  }
  async validateTicketOwnership(ticketId: number, userId: number): Promise<boolean> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        booking: {
          select: { userId: true },
        },
      },
    });
    if (!ticket) {
      throw new NotFoundException({
        code: ERROR_CODES.CHECKIN_006,
        message: getErrorMessage(ERROR_CODES.CHECKIN_006),
      });
    }
    if (ticket.booking && ticket.booking.userId === userId) {
      return true;
    }
    if (ticket.holderUserId === userId) {
      return true;
    }
    return false;
  }
  async generateQRCode(
    ticketId: number,
    userId: number,
  ): Promise<{
    qrDataUrl: string;
    expiresAt: Date;
  }> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        booking: true,
        show: true,
      },
    });
    if (!ticket) {
      throw new NotFoundException({
        code: ERROR_CODES.CHECKIN_006,
        message: getErrorMessage(ERROR_CODES.CHECKIN_006),
      });
    }
    if (ticket.status !== TicketStatus.SOLD) {
      throw new BadRequestException({
        code: ERROR_CODES.CHECKIN_006,
        message: 'Vé chưa được thanh toán.',
      });
    }
    if (!ticket.booking || ticket.booking.userId !== userId) {
      throw new BadRequestException({
        code: ERROR_CODES.AUTH_003,
        message: getErrorMessage(ERROR_CODES.AUTH_003),
      });
    }
    if (!ticket.ticketCode) {
      throw new BadRequestException({
        code: ERROR_CODES.CHECKIN_006,
        message: 'Vé chưa có mã. Vui lòng liên hệ hỗ trợ.',
      });
    }
    const iat = Math.floor(Date.now() / 1000);
    const payload: QRPayload = {
      tc: ticket.ticketCode,
      bk: ticket.booking.bookingCode,
      sh: ticket.showId,
      iat,
    };
    const qrString = this.createSignedQRString(payload);
    const qrDataUrl = await QRCode.toDataURL(qrString, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300,
      margin: 2,
    });
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    this.logger.log(`Generated QR for ticket ${ticketId}, user ${userId}`);
    return { qrDataUrl, expiresAt };
  }
  async checkIn(
    checkInDto: CheckInDto,
    staffUserId?: number,
    ipAddress?: string,
  ): Promise<CheckInResult> {
    const { qr, deviceId } = checkInDto;
    const payload = this.verifyAndDecodeQR(qr);
    const nonceKey = CacheKeys.qrNonce(0, payload.iat);
    const existingNonce = await this.cache.get(nonceKey);
    if (existingNonce) {
      throw new BadRequestException({
        code: ERROR_CODES.CHECKIN_005,
        message: getErrorMessage(ERROR_CODES.CHECKIN_005),
      });
    }
    const ticket = await this.prisma.ticket.findFirst({
      where: { ticketCode: payload.tc },
      include: {
        show: true,
        booking: true,
        physicalSeat: true,
        ticketClass: true,
      },
    });
    if (!ticket) {
      throw new NotFoundException({
        code: ERROR_CODES.CHECKIN_006,
        message: getErrorMessage(ERROR_CODES.CHECKIN_006),
      });
    }
    if (ticket.status !== TicketStatus.SOLD) {
      throw new BadRequestException({
        code: ERROR_CODES.CHECKIN_006,
        message: 'Vé chưa được thanh toán.',
      });
    }
    if (!ticket.booking || ticket.booking.bookingCode !== payload.bk) {
      throw new BadRequestException({
        code: ERROR_CODES.CHECKIN_001,
        message: getErrorMessage(ERROR_CODES.CHECKIN_001),
      });
    }
    if (ticket.isCheckedIn) {
      throw new BadRequestException({
        code: ERROR_CODES.CHECKIN_003,
        message: `${getErrorMessage(ERROR_CODES.CHECKIN_003)} Thời gian: ${ticket.checkedInAt?.toLocaleString('vi-VN')}`,
      });
    }
    if (!ticket.show || !ticket.showId) {
      throw new BadRequestException({
        code: ERROR_CODES.CHECKIN_006,
        message:
          'Vé này chưa được kích hoạt cho sự kiện nào. Vui lòng chọn sự kiện trước khi check-in.',
      });
    }
    if (ticket.showId !== payload.sh) {
      throw new BadRequestException({
        code: ERROR_CODES.CHECKIN_001,
        message: 'Mã QR không khớp với sự kiện.',
      });
    }
    if (ticket.show.status === 'CANCELLED') {
      throw new BadRequestException({
        code: ERROR_CODES.SHOW_002,
        message: 'Sự kiện đã bị hủy.',
      });
    }
    const now = new Date();
    if (ticket.show.checkInTime && now < ticket.show.checkInTime) {
      throw new BadRequestException({
        code: ERROR_CODES.CHECKIN_004,
        message: `${getErrorMessage(ERROR_CODES.CHECKIN_004)} Check-in mở lúc: ${ticket.show.checkInTime.toLocaleString('vi-VN')}`,
      });
    }
    await this.cache.set(
      nonceKey,
      { ticketId: ticket.id, usedAt: now.toISOString() },
      CACHE_TTL.QR_NONCE,
    );
    const checkinMeta = {
      deviceId: deviceId || null,
      staffUserId: staffUserId || null,
      ipAddress: ipAddress || null,
      qrIat: payload.iat,
      checkedInAt: now.toISOString(),
    };
    await this.prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        isCheckedIn: true,
        checkedInAt: now,
        checkinMeta,
      },
    });
    let seatInfo: string | null = null;
    if (ticket.physicalSeat) {
      const seat = ticket.physicalSeat;
      seatInfo = `${seat.zoneName} - Hàng ${seat.rowName} - Ghế ${seat.seatNumber}`;
    }
    this.logger.log(
      `Ticket ${ticket.id} (${ticket.ticketCode || 'no-code'}) checked in by staff ${staffUserId || 'unknown'}`,
    );
    return {
      success: true,
      ticketId: ticket.id,
      ticketCode: ticket.ticketCode || payload.tc,
      showTitle: ticket.show.title,
      seatInfo,
      checkedInAt: now,
      message: 'Check-in thành công!',
    };
  }
  async getCheckInStats(showId: number) {
    const [total, checkedIn, sold] = await Promise.all([
      this.prisma.ticket.count({ where: { showId } }),
      this.prisma.ticket.count({ where: { showId, isCheckedIn: true } }),
      this.prisma.ticket.count({ where: { showId, status: TicketStatus.SOLD } }),
    ]);
    return {
      showId,
      totalTickets: total,
      soldTickets: sold,
      checkedIn,
      notCheckedIn: sold - checkedIn,
      checkInRate: sold > 0 ? Math.round((checkedIn / sold) * 100) : 0,
    };
  }
  private createSignedQRString(payload: QRPayload): string {
    const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = this.createHmacSignature(payloadStr);
    return `${QR_PREFIX}${payloadStr}.${signature}`;
  }
  private verifyAndDecodeQR(qrString: string): QRPayload {
    if (!qrString.startsWith(QR_PREFIX)) {
      throw new BadRequestException({
        code: ERROR_CODES.CHECKIN_001,
        message: getErrorMessage(ERROR_CODES.CHECKIN_001),
      });
    }
    const data = qrString.slice(QR_PREFIX.length);
    const parts = data.split('.');
    if (parts.length !== 2) {
      throw new BadRequestException({
        code: ERROR_CODES.CHECKIN_001,
        message: getErrorMessage(ERROR_CODES.CHECKIN_001),
      });
    }
    const [payloadB64, signature] = parts;
    const expectedSignature = this.createHmacSignature(payloadB64);
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      throw new BadRequestException({
        code: ERROR_CODES.CHECKIN_002,
        message: getErrorMessage(ERROR_CODES.CHECKIN_002),
      });
    }
    try {
      const payloadStr = Buffer.from(payloadB64, 'base64').toString('utf-8');
      const payload = JSON.parse(payloadStr) as QRPayload;
      if (!payload.tc || !payload.bk || !payload.iat) {
        throw new Error('Missing required fields');
      }
      const maxAge = 24 * 60 * 60;
      const now = Math.floor(Date.now() / 1000);
      if (now - payload.iat > maxAge) {
        throw new BadRequestException({
          code: ERROR_CODES.CHECKIN_005,
          message: 'Mã QR đã hết hạn. Vui lòng tạo mã mới.',
        });
      }
      return payload;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        code: ERROR_CODES.CHECKIN_001,
        message: getErrorMessage(ERROR_CODES.CHECKIN_001),
      });
    }
  }
  @LogMethod({ logParams: true, sanitize: true })
  async suspendTicket(userId: number, ticketId: number) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        show: true,
        booking: true,
      },
    });
    if (!ticket) {
      throw new NotFoundException({
        code: ERROR_CODES.TICKET_001,
        message: 'Vé không tồn tại.',
      });
    }
    if (ticket.holderUserId !== userId && ticket.booking?.userId !== userId) {
      throw new BadRequestException({
        code: ERROR_CODES.AUTH_003,
        message: 'Bạn không có quyền thao tác trên vé này.',
      });
    }
    if (ticket.status === TicketStatus.SUSPENDED) {
      throw new BadRequestException('Vé đã bị ngưng hoạt động.');
    }
    if (ticket.status !== TicketStatus.SOLD) {
      throw new BadRequestException('Chỉ có thể ngưng vé đã thanh toán.');
    }
    if (!ticket.show || !ticket.show.performTime) {
      throw new BadRequestException('Thông tin show không hợp lệ.');
    }
    const now = new Date();
    const showTime = new Date(ticket.show.performTime);
    const diffMs = showTime.getTime() - now.getTime();
    const hoursDiff = diffMs / (1000 * 60 * 60);
    if (hoursDiff < 48) {
      throw new BadRequestException('Chỉ có thể ngưng vé trước giờ diễn ít nhất 48 giờ.');
    }
    await this.prisma.$transaction(async (tx) => {
      await tx.ticket.update({
        where: { id: ticketId },
        data: {
          status: TicketStatus.SUSPENDED,
          suspendedAt: new Date(),
          physicalSeatId: null,
          lockedAt: null,
          holderUserId: null,
        },
      });
    });
    if (ticket.showId) {
      await this.invalidateShowTicketCache(ticket.showId);
    }
    await this.cache.del(CacheKeys.userBookings(userId));
    this.logger.log(`Ticket ${ticketId} suspended by user ${userId}`);
    return {
      success: true,
      message:
        'Đã ngưng vé thành công. Vé này hiện ở trạng thái chờ và có thể sử dụng cho show khác.',
    };
  }
  private createHmacSignature(data: string): string {
    return crypto.createHmac('sha256', this.qrSecret).update(data).digest('hex');
  }
  @LogMethod({ logParams: true, sanitize: true })
  async reactivateTicket(ticketId: number, adminId: number) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { booking: true },
    });
    if (!ticket) {
      throw new NotFoundException({
        code: ERROR_CODES.TICKET_001,
        message: 'Vé không tồn tại.',
      });
    }
    if (ticket.status !== TicketStatus.SUSPENDED) {
      throw new BadRequestException('Vé không ở trạng thái tạm ngưng.');
    }
    await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: TicketStatus.AVAILABLE,
        suspendedAt: null,
      },
    });
    this.logger.log(`Ticket ${ticketId} reactivated by admin ${adminId}`);
    return {
      success: true,
      message: 'Đã kích hoạt lại vé thành công. Trạng thái hiện tại: Sẵn sàng.',
    };
  }
}
