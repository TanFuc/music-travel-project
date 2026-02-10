import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  VerifyTicketDto,
  ManualEntryDto,
  VerificationMethod,
  AttendanceStatsDto,
} from './dto/ticket-verification.dto';
import * as crypto from 'crypto';

@Injectable()
export class TicketVerificationService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // TICKET VERIFICATION
  // ============================================================================

  async verifyTicket(dto: VerifyTicketDto, verifierId: number) {
    // Find ticket by code
    const ticket = await this.prisma.ticket.findUnique({
      where: { ticketCode: dto.ticketCode },
      include: {
        ticketClass: true,
        ticketTier: true,
        booking: {
          include: {
            user: {
              select: { id: true, fullName: true, phoneNumber: true },
            },
          },
        },
      },
    });

    if (!ticket) {
      // Log failed attempt
      await this.logFailedVerification(
        dto.showId,
        dto.ticketCode,
        verifierId,
        'TICKET_NOT_FOUND',
        dto,
      );
      return {
        success: false,
        message: 'Ticket not found',
        error: { code: 'TICKET_NOT_FOUND', details: 'No ticket found with the provided code' },
      };
    }

    // Validate ticket status
    const validStatuses = ['SOLD', 'AVAILABLE'];
    if (!validStatuses.includes(ticket.status)) {
      await this.logFailedVerification(
        dto.showId,
        dto.ticketCode,
        verifierId,
        'INVALID_TICKET_STATUS',
        dto,
      );
      return {
        success: false,
        message: `Ticket status is ${ticket.status}`,
        error: {
          code: 'INVALID_TICKET_STATUS',
          details: `Ticket is ${ticket.status.toLowerCase()}`,
        },
      };
    }

    // Get show info
    const show = await this.prisma.show.findUnique({
      where: { id: dto.showId },
    });

    if (!show) {
      return {
        success: false,
        message: 'Show not found',
        error: { code: 'SHOW_NOT_FOUND' },
      };
    }

    // Check show status
    if (show.status === 'CANCELLED') {
      return {
        success: false,
        message: 'Show has been cancelled',
        error: { code: 'SHOW_CANCELLED' },
      };
    }

    // Get ticket holder user ID
    const userId = ticket.booking?.userId || ticket.holderUserId;
    if (!userId) {
      await this.logFailedVerification(
        dto.showId,
        dto.ticketCode,
        verifierId,
        'NO_TICKET_HOLDER',
        dto,
      );
      return {
        success: false,
        message: 'Ticket has no associated user',
        error: { code: 'NO_TICKET_HOLDER' },
      };
    }

    // Check if ticket has already been used for this show (General Admission - one entry per show)
    const existingVerification = await this.prisma.ticketVerification.findUnique({
      where: {
        ticketId_showId: {
          ticketId: ticket.id,
          showId: dto.showId,
        },
      },
    });

    if (existingVerification && !dto.isReEntry) {
      return {
        success: false,
        message: 'Ticket already used for this show',
        error: {
          code: 'TICKET_ALREADY_USED',
          details: `Entry recorded at ${existingVerification.verifiedAt.toISOString()}`,
        },
        ticketInfo: {
          ticketCode: ticket.ticketCode || '',
          holderName: ticket.booking?.user?.fullName || 'Unknown',
          ticketTier: ticket.ticketTier?.name,
          ticketClass: ticket.ticketClass?.name || undefined,
        },
      };
    }

    // Check capacity if maxCapacity is set
    if (show.maxCapacity && show.currentAttendance >= show.maxCapacity && !dto.isReEntry) {
      await this.logFailedVerification(
        dto.showId,
        dto.ticketCode,
        verifierId,
        'CAPACITY_FULL',
        dto,
      );
      return {
        success: false,
        message: 'Show is at full capacity',
        error: { code: 'CAPACITY_FULL', details: `${show.currentAttendance}/${show.maxCapacity}` },
      };
    }

    // If re-entry, we need to update the existing record (or allow it)
    if (dto.isReEntry && existingVerification) {
      // Create a re-entry log (we'll use ShowActivityLog for this)
      await this.logReEntry(dto.showId, ticket.id, userId, verifierId, dto);

      return {
        success: true,
        message: 'Re-entry approved',
        verification: {
          id: existingVerification.id,
          ticketId: existingVerification.ticketId,
          showId: existingVerification.showId,
          userId: existingVerification.userId,
          verifiedAt: new Date(),
          isReEntry: true,
        },
        ticketInfo: {
          ticketCode: ticket.ticketCode || '',
          holderName: ticket.booking?.user?.fullName || 'Unknown',
          ticketTier: ticket.ticketTier?.name,
          ticketClass: ticket.ticketClass?.name || undefined,
        },
        showInfo: {
          id: show.id,
          title: show.title,
          currentAttendance: show.currentAttendance,
          maxCapacity: show.maxCapacity || undefined,
        },
      };
    }

    // Create verification record
    const verification = await this.prisma.ticketVerification.create({
      data: {
        showId: dto.showId,
        ticketId: ticket.id,
        userId,
        verifiedBy: verifierId,
        verificationMethod: dto.verificationMethod,
        isReEntry: false,
        deviceInfo: dto.deviceInfo,
        notes: dto.notes,
        isSuccessful: true,
      },
    });

    // Update show attendance
    await this.prisma.show.update({
      where: { id: dto.showId },
      data: { currentAttendance: { increment: 1 } },
    });

    // Update ticket check-in status
    await this.prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        isCheckedIn: true,
        checkedInAt: new Date(),
        checkinMeta: {
          showId: dto.showId,
          verificationId: verification.id,
          verifiedAt: new Date().toISOString(),
        },
      },
    });

    // Log activity
    await this.logVerificationActivity(dto.showId, ticket.id, userId, verifierId, 'SUCCESS', dto);

    return {
      success: true,
      message: 'Entry approved',
      verification: {
        id: verification.id,
        ticketId: verification.ticketId,
        showId: verification.showId,
        userId: verification.userId,
        verifiedAt: verification.verifiedAt,
        isReEntry: verification.isReEntry,
      },
      ticketInfo: {
        ticketCode: ticket.ticketCode || '',
        holderName: ticket.booking?.user?.fullName || 'Unknown',
        ticketTier: ticket.ticketTier?.name,
        ticketClass: ticket.ticketClass?.name || undefined,
      },
      showInfo: {
        id: show.id,
        title: show.title,
        currentAttendance: show.currentAttendance + 1,
        maxCapacity: show.maxCapacity || undefined,
      },
    };
  }

  async verifyTicketByQR(qrData: string, showId: number, verifierId: number, deviceInfo?: string) {
    // Parse QR data - expected format: ticketCode|securityHash|timestamp
    let ticketCode: string;
    let securityHash: string;
    let timestamp: string;

    try {
      const parts = qrData.split('|');
      if (parts.length < 2) {
        // Try alternative format - just ticket code
        ticketCode = qrData;
      } else {
        [ticketCode, securityHash, timestamp] = parts;

        // Verify security hash (optional validation)
        if (securityHash && timestamp) {
          const expectedHash = this.generateSecurityHash(ticketCode, timestamp);
          if (securityHash !== expectedHash) {
            // Hash mismatch - could be tampering, but we'll still try to verify by code
            console.warn('QR code security hash mismatch', { ticketCode });
          }
        }
      }
    } catch {
      return {
        success: false,
        message: 'Invalid QR code format',
        error: { code: 'INVALID_QR_FORMAT' },
      };
    }

    return this.verifyTicket(
      {
        ticketCode,
        showId,
        verificationMethod: VerificationMethod.QR_SCAN,
        deviceInfo,
      },
      verifierId,
    );
  }

  async manualEntry(dto: ManualEntryDto, verifierId: number) {
    const show = await this.prisma.show.findUnique({
      where: { id: dto.showId },
    });

    if (!show) {
      throw new NotFoundException('Show not found');
    }

    // Check capacity
    if (show.maxCapacity && show.currentAttendance >= show.maxCapacity) {
      throw new BadRequestException('Show is at full capacity');
    }

    // Find or validate user
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If ticket ID provided, verify it belongs to user
    let ticket = null;
    if (dto.ticketId) {
      ticket = await this.prisma.ticket.findUnique({
        where: { id: dto.ticketId },
        include: { booking: true },
      });

      if (
        !ticket ||
        (ticket.booking?.userId !== dto.userId && ticket.holderUserId !== dto.userId)
      ) {
        throw new BadRequestException('Ticket does not belong to this user');
      }
    }

    // Create verification record for manual entry
    const verification = await this.prisma.ticketVerification.create({
      data: {
        showId: dto.showId,
        ticketId: dto.ticketId || 0, // Use 0 for manual entries without ticket
        userId: dto.userId,
        verifiedBy: verifierId,
        verificationMethod: 'MANUAL_ENTRY',
        isReEntry: false,
        notes: dto.notes || `Manual entry. Reason: ${dto.reason || 'Admin override'}`,
        isSuccessful: true,
      },
    });

    // Update show attendance
    await this.prisma.show.update({
      where: { id: dto.showId },
      data: { currentAttendance: { increment: 1 } },
    });

    // Log activity
    await this.prisma.showActivityLog.create({
      data: {
        showId: dto.showId,
        activityType: 'ADMIN_ACTION',
        actorId: verifierId,
        targetId: dto.userId,
        targetType: 'USER',
        description: `Manual entry for user ${user.fullName}. Reason: ${dto.reason || 'Admin override'}`,
        metadata: {
          verificationId: verification.id,
          ticketId: dto.ticketId,
          notes: dto.notes,
        },
      },
    });

    return {
      success: true,
      message: 'Manual entry recorded',
      verification: {
        id: verification.id,
        ticketId: verification.ticketId,
        showId: verification.showId,
        userId: verification.userId,
        verifiedAt: verification.verifiedAt,
        isReEntry: false,
      },
      showInfo: {
        id: show.id,
        title: show.title,
        currentAttendance: show.currentAttendance + 1,
        maxCapacity: show.maxCapacity || undefined,
      },
    };
  }

  // ============================================================================
  // VERIFICATION HISTORY & ANALYTICS
  // ============================================================================

  async getVerifications(filters: {
    showId?: number;
    ticketId?: number;
    userId?: number;
    verificationMethod?: string;
    successfulOnly?: boolean;
    page?: number;
    limit?: number;
  }) {
    const where: any = {};

    if (filters.showId) where.showId = filters.showId;
    if (filters.ticketId) where.ticketId = filters.ticketId;
    if (filters.userId) where.userId = filters.userId;
    if (filters.verificationMethod) where.verificationMethod = filters.verificationMethod;
    if (filters.successfulOnly) where.isSuccessful = true;

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const [verifications, total] = await Promise.all([
      this.prisma.ticketVerification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { verifiedAt: 'desc' },
        include: {
          show: { select: { id: true, title: true } },
          ticket: { select: { id: true, ticketCode: true } },
          user: { select: { id: true, fullName: true, phoneNumber: true } },
          verifier: { select: { id: true, fullName: true } },
        },
      }),
      this.prisma.ticketVerification.count({ where }),
    ]);

    return {
      data: verifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getShowAttendance(showId: number): Promise<AttendanceStatsDto> {
    const show = await this.prisma.show.findUnique({
      where: { id: showId },
    });

    if (!show) {
      throw new NotFoundException('Show not found');
    }

    const [
      totalVerifications,
      successfulVerifications,
      failedVerifications,
      reEntries,
      qrScans,
      manualEntries,
      recentVerifications,
    ] = await Promise.all([
      this.prisma.ticketVerification.count({ where: { showId } }),
      this.prisma.ticketVerification.count({ where: { showId, isSuccessful: true } }),
      this.prisma.ticketVerification.count({ where: { showId, isSuccessful: false } }),
      this.prisma.ticketVerification.count({ where: { showId, isReEntry: true } }),
      this.prisma.ticketVerification.count({ where: { showId, verificationMethod: 'QR_SCAN' } }),
      this.prisma.ticketVerification.count({
        where: { showId, verificationMethod: 'MANUAL_ENTRY' },
      }),
      this.prisma.ticketVerification.findMany({
        where: { showId, isSuccessful: true },
        take: 10,
        orderBy: { verifiedAt: 'desc' },
        include: {
          ticket: { select: { ticketCode: true } },
          user: { select: { fullName: true } },
        },
      }),
    ]);

    return {
      showId: show.id,
      showTitle: show.title,
      maxCapacity: show.maxCapacity,
      currentAttendance: show.currentAttendance,
      attendancePercentage: show.maxCapacity
        ? Math.round((show.currentAttendance / show.maxCapacity) * 100)
        : null,
      totalVerifications,
      successfulVerifications,
      failedVerifications,
      reEntries,
      verificationsBreakdown: {
        QR_SCAN: qrScans,
        MANUAL_ENTRY: manualEntries,
      },
      recentVerifications: recentVerifications.map((v) => ({
        id: v.id,
        ticketCode: v.ticket.ticketCode || '',
        holderName: v.user.fullName,
        verifiedAt: v.verifiedAt,
        isReEntry: v.isReEntry,
      })),
    };
  }

  async getTicketVerificationHistory(ticketCode: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { ticketCode },
      include: {
        ticketClass: true,
        ticketTier: true,
        booking: {
          include: {
            user: { select: { id: true, fullName: true, phoneNumber: true } },
          },
        },
        ticketVerifications: {
          include: {
            show: { select: { id: true, title: true, performTime: true } },
            verifier: { select: { id: true, fullName: true } },
          },
          orderBy: { verifiedAt: 'desc' },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return {
      ticket: {
        id: ticket.id,
        ticketCode: ticket.ticketCode,
        status: ticket.status,
        holderName: ticket.booking?.user?.fullName,
        ticketTier: ticket.ticketTier?.name,
        ticketClass: ticket.ticketClass?.name,
        isCheckedIn: ticket.isCheckedIn,
      },
      verificationHistory: ticket.ticketVerifications.map((v) => ({
        id: v.id,
        showId: v.showId,
        showTitle: v.show.title,
        showDate: v.show.performTime,
        verifiedAt: v.verifiedAt,
        verificationMethod: v.verificationMethod,
        verifiedBy: v.verifier.fullName,
        isReEntry: v.isReEntry,
        isSuccessful: v.isSuccessful,
        failureReason: v.failureReason,
      })),
      totalShowsAttended: ticket.ticketVerifications.filter((v) => v.isSuccessful && !v.isReEntry)
        .length,
    };
  }

  // ============================================================================
  // QR CODE GENERATION
  // ============================================================================

  generateTicketQRData(ticketCode: string): string {
    const timestamp = Date.now().toString();
    const securityHash = this.generateSecurityHash(ticketCode, timestamp);
    return `${ticketCode}|${securityHash}|${timestamp}`;
  }

  private generateSecurityHash(ticketCode: string, timestamp: string): string {
    const secret = process.env.QR_SECRET_KEY || 'default-secret-key';
    return crypto
      .createHmac('sha256', secret)
      .update(`${ticketCode}${timestamp}`)
      .digest('hex')
      .substring(0, 16);
  }

  // ============================================================================
  // LOGGING HELPERS
  // ============================================================================

  private async logFailedVerification(
    showId: number,
    ticketCode: string,
    verifierId: number,
    reason: string,
    dto: VerifyTicketDto,
  ) {
    await this.prisma.showActivityLog.create({
      data: {
        showId,
        activityType: 'TICKET_VERIFICATION',
        actorId: verifierId,
        description: `Failed verification attempt for ticket ${ticketCode}. Reason: ${reason}`,
        metadata: {
          ticketCode,
          reason,
          verificationMethod: dto.verificationMethod,
          deviceInfo: dto.deviceInfo,
        },
      },
    });
  }

  private async logVerificationActivity(
    showId: number,
    ticketId: number,
    userId: number,
    verifierId: number,
    status: string,
    dto: VerifyTicketDto,
  ) {
    await this.prisma.showActivityLog.create({
      data: {
        showId,
        activityType: 'TICKET_VERIFICATION',
        actorId: verifierId,
        targetId: ticketId,
        targetType: 'TICKET',
        description: `Ticket verified successfully via ${dto.verificationMethod}`,
        metadata: {
          ticketId,
          userId,
          status,
          verificationMethod: dto.verificationMethod,
          deviceInfo: dto.deviceInfo,
        },
      },
    });
  }

  private async logReEntry(
    showId: number,
    ticketId: number,
    userId: number,
    verifierId: number,
    dto: VerifyTicketDto,
  ) {
    await this.prisma.showActivityLog.create({
      data: {
        showId,
        activityType: 'CHECK_IN',
        actorId: verifierId,
        targetId: ticketId,
        targetType: 'TICKET',
        description: `Re-entry approved for ticket ${dto.ticketCode}`,
        metadata: {
          ticketId,
          userId,
          isReEntry: true,
          verificationMethod: dto.verificationMethod,
          deviceInfo: dto.deviceInfo,
        },
      },
    });
  }
}
