import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateActivityLogDto, ShowActivityType, ShowAnalyticsDto } from './dto/show-activity.dto';

@Injectable()
export class ShowActivityService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // ACTIVITY LOGGING
  // ============================================================================

  async createActivityLog(dto: CreateActivityLogDto) {
    return this.prisma.showActivityLog.create({
      data: {
        showId: dto.showId,
        activityType: dto.activityType as any,
        actorId: dto.actorId,
        targetId: dto.targetId,
        targetType: dto.targetType,
        description: dto.description,
        metadata: dto.metadata,
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent,
      },
      include: {
        actor: {
          select: { id: true, fullName: true, role: true },
        },
      },
    });
  }

  async logRegistration(
    showId: number,
    registrationId: number,
    userId: number | null,
    guestName: string | null,
    songTitle: string,
    ipAddress?: string,
  ) {
    const performerName = guestName || (userId ? await this.getUserName(userId) : 'Unknown');

    return this.createActivityLog({
      showId,
      activityType: ShowActivityType.REGISTRATION,
      actorId: userId || undefined,
      targetId: registrationId,
      targetType: 'REGISTRATION',
      description: `New registration: "${songTitle}" by ${performerName}`,
      metadata: { registrationId, songTitle, performerName },
      ipAddress,
    });
  }

  async logCancellation(
    showId: number,
    registrationId: number,
    userId: number | null,
    songTitle: string,
    reason?: string,
    isAdminAction?: boolean,
    adminId?: number,
  ) {
    const actorId = isAdminAction ? adminId : userId || undefined;
    const actorName = actorId ? await this.getUserName(actorId) : 'Unknown';

    return this.createActivityLog({
      showId,
      activityType: ShowActivityType.CANCELLATION,
      actorId,
      targetId: registrationId,
      targetType: 'REGISTRATION',
      description: isAdminAction
        ? `Admin ${actorName} cancelled registration "${songTitle}"${reason ? `: ${reason}` : ''}`
        : `Registration "${songTitle}" cancelled by performer`,
      metadata: { registrationId, songTitle, reason, isAdminAction, adminId },
    });
  }

  async logStatusChange(
    showId: number,
    registrationId: number,
    oldStatus: string,
    newStatus: string,
    adminId: number,
    notes?: string,
  ) {
    const adminName = await this.getUserName(adminId);

    return this.createActivityLog({
      showId,
      activityType: ShowActivityType.STATUS_CHANGE,
      actorId: adminId,
      targetId: registrationId,
      targetType: 'REGISTRATION',
      description: `Status changed from ${oldStatus} to ${newStatus} by ${adminName}${notes ? `. Note: ${notes}` : ''}`,
      metadata: { registrationId, oldStatus, newStatus, notes },
    });
  }

  async logQueueReorder(
    showId: number,
    adminId: number,
    changes: { registrationId: number; oldPosition: number; newPosition: number }[],
  ) {
    const adminName = await this.getUserName(adminId);

    return this.createActivityLog({
      showId,
      activityType: ShowActivityType.QUEUE_REORDER,
      actorId: adminId,
      description: `Queue reordered by ${adminName}. ${changes.length} position(s) changed.`,
      metadata: { changes },
    });
  }

  async logAdminAction(
    showId: number,
    adminId: number,
    action: string,
    details?: Record<string, any>,
  ) {
    const adminName = await this.getUserName(adminId);

    return this.createActivityLog({
      showId,
      activityType: ShowActivityType.ADMIN_ACTION,
      actorId: adminId,
      description: `${action} by ${adminName}`,
      metadata: details,
    });
  }

  // ============================================================================
  // ACTIVITY RETRIEVAL
  // ============================================================================

  async getShowActivityLogs(
    showId: number,
    filters: {
      activityType?: string;
      actorId?: number;
      targetType?: string;
      search?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const show = await this.prisma.show.findUnique({
      where: { id: showId },
    });

    if (!show) {
      throw new NotFoundException('Show not found');
    }

    const where: any = { showId };

    if (filters.activityType) {
      where.activityType = filters.activityType;
    }

    if (filters.actorId) {
      where.actorId = filters.actorId;
    }

    if (filters.targetType) {
      where.targetType = filters.targetType;
    }

    if (filters.search) {
      where.description = { contains: filters.search, mode: 'insensitive' };
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.showActivityLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: { id: true, fullName: true, role: true },
          },
        },
      }),
      this.prisma.showActivityLog.count({ where }),
    ]);

    return {
      show: {
        id: show.id,
        title: show.title,
      },
      data: logs.map((log) => ({
        id: Number(log.id),
        activityType: log.activityType,
        actor: log.actor
          ? {
              id: log.actor.id,
              name: log.actor.fullName,
              role: log.actor.role,
            }
          : null,
        targetId: log.targetId,
        targetType: log.targetType,
        description: log.description,
        metadata: log.metadata,
        createdAt: log.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getActivitySummary(showId: number) {
    const show = await this.prisma.show.findUnique({
      where: { id: showId },
    });

    if (!show) {
      throw new NotFoundException('Show not found');
    }

    const activityTypes = [
      'REGISTRATION',
      'CANCELLATION',
      'STATUS_CHANGE',
      'TICKET_VERIFICATION',
      'ADMIN_ACTION',
      'QUEUE_REORDER',
      'CHECK_IN',
    ];

    const counts = await Promise.all(
      activityTypes.map((type) =>
        this.prisma.showActivityLog.count({
          where: { showId, activityType: type as any },
        }),
      ),
    );

    const breakdown: Record<string, number> = {};
    activityTypes.forEach((type, index) => {
      breakdown[type] = counts[index];
    });

    const total = counts.reduce((sum, count) => sum + count, 0);

    const recentActivities = await this.prisma.showActivityLog.findMany({
      where: { showId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: {
          select: { id: true, fullName: true },
        },
      },
    });

    return {
      showId,
      showTitle: show.title,
      totalActivities: total,
      breakdown,
      recentActivities: recentActivities.map((a) => ({
        id: Number(a.id),
        type: a.activityType,
        description: a.description,
        actor: a.actor?.fullName,
        createdAt: a.createdAt,
      })),
    };
  }

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  async getShowAnalytics(showId: number): Promise<ShowAnalyticsDto> {
    const show = await this.prisma.show.findUnique({
      where: { id: showId },
    });

    if (!show) {
      throw new NotFoundException('Show not found');
    }

    // Registration stats
    const [
      totalRegistrations,
      pendingRegistrations,
      approvedRegistrations,
      performedRegistrations,
      cancelledRegistrations,
    ] = await Promise.all([
      this.prisma.performanceRegistration.count({ where: { showId } }),
      this.prisma.performanceRegistration.count({ where: { showId, status: 'PENDING' } }),
      this.prisma.performanceRegistration.count({ where: { showId, status: 'APPROVED' } }),
      this.prisma.performanceRegistration.count({ where: { showId, status: 'PERFORMED' } }),
      this.prisma.performanceRegistration.count({ where: { showId, status: 'CANCELLED' } }),
    ]);

    // Check for no-shows (registrations marked as cancelled with no-show note)
    const noShowCount = await this.prisma.performanceRegistration.count({
      where: {
        showId,
        status: 'CANCELLED',
        reviewNote: { contains: 'No show', mode: 'insensitive' },
      },
    });

    const noShowRate = totalRegistrations > 0 ? (noShowCount / totalRegistrations) * 100 : 0;

    // Verification stats
    const [totalVerifications, qrScanVerifications, manualEntryVerifications] = await Promise.all([
      this.prisma.ticketVerification.count({ where: { showId } }),
      this.prisma.ticketVerification.count({ where: { showId, verificationMethod: 'QR_SCAN' } }),
      this.prisma.ticketVerification.count({
        where: { showId, verificationMethod: 'MANUAL_ENTRY' },
      }),
    ]);

    // Activity stats
    const activityCounts = await this.prisma.showActivityLog.groupBy({
      by: ['activityType'],
      where: { showId },
      _count: { id: true },
    });

    const activityBreakdown: Record<string, number> = {};
    activityCounts.forEach((item) => {
      activityBreakdown[item.activityType] = item._count.id;
    });

    const totalActivities = Object.values(activityBreakdown).reduce((sum, count) => sum + count, 0);

    // Performance type stats
    const performanceTypes = await this.prisma.performanceRegistration.groupBy({
      by: ['performanceType'],
      where: { showId },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    // Average performance duration
    const avgDuration = await this.prisma.performanceRegistration.aggregate({
      where: { showId, duration: { not: null } },
      _avg: { duration: true },
    });

    // Registrations over time (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const registrationsByDay = await this.prisma.performanceRegistration.groupBy({
      by: ['registeredAt'],
      where: {
        showId,
        registeredAt: { gte: sevenDaysAgo },
      },
      _count: { id: true },
    });

    // Group by date (simplified)
    const registrationsOverTime: Array<{ date: string; count: number }> = [];
    const dateMap = new Map<string, number>();

    registrationsByDay.forEach((item) => {
      const dateStr = item.registeredAt.toISOString().split('T')[0];
      dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + item._count.id);
    });

    dateMap.forEach((count, date) => {
      registrationsOverTime.push({ date, count });
    });

    registrationsOverTime.sort((a, b) => a.date.localeCompare(b.date));

    // Verifications over time (last 24 hours, by hour)
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    const verificationsByHour = await this.prisma.ticketVerification.groupBy({
      by: ['verifiedAt'],
      where: {
        showId,
        verifiedAt: { gte: oneDayAgo },
      },
      _count: { id: true },
    });

    const hourMap = new Map<string, number>();
    verificationsByHour.forEach((item) => {
      const hour = item.verifiedAt.toISOString().slice(0, 13); // YYYY-MM-DDTHH
      hourMap.set(hour, (hourMap.get(hour) || 0) + item._count.id);
    });

    const verificationsOverTime: Array<{ time: string; count: number }> = [];
    hourMap.forEach((count, time) => {
      verificationsOverTime.push({ time, count });
    });

    verificationsOverTime.sort((a, b) => a.time.localeCompare(b.time));

    return {
      showId: show.id,
      showTitle: show.title,
      performTime: show.performTime,
      totalRegistrations,
      pendingRegistrations,
      approvedRegistrations,
      performedRegistrations,
      cancelledRegistrations,
      noShowRate: Math.round(noShowRate * 100) / 100,
      maxCapacity: show.maxCapacity,
      currentAttendance: show.currentAttendance,
      attendancePercentage: show.maxCapacity
        ? Math.round((show.currentAttendance / show.maxCapacity) * 100)
        : null,
      totalVerifications,
      qrScanVerifications,
      manualEntryVerifications,
      totalActivities,
      activityBreakdown,
      registrationsOverTime,
      verificationsOverTime,
      averagePerformanceDuration: avgDuration._avg.duration || null,
      mostPopularPerformanceTypes: performanceTypes.map((pt) => ({
        type: pt.performanceType,
        count: pt._count.id,
      })),
    };
  }

  async exportActivityLogs(showId: number, format: 'csv' | 'json') {
    const logs = await this.prisma.showActivityLog.findMany({
      where: { showId },
      orderBy: { createdAt: 'desc' },
      include: {
        actor: { select: { fullName: true } },
      },
    });

    if (format === 'json') {
      return logs;
    }

    // CSV format
    const headers = [
      'ID',
      'Type',
      'Actor',
      'Target ID',
      'Target Type',
      'Description',
      'Created At',
    ];
    const rows = logs.map((log) => [
      log.id.toString(),
      log.activityType,
      log.actor?.fullName || '',
      log.targetId?.toString() || '',
      log.targetType || '',
      `"${log.description.replace(/"/g, '""')}"`,
      log.createdAt.toISOString(),
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  private async getUserName(userId: number): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true },
    });
    return user?.fullName || 'Unknown';
  }
}
