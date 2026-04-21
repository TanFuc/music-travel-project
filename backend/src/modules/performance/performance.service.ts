import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CreatePerformanceQRCodeDto,
  CreatePerformanceRegistrationDto,
  ReviewRegistrationDto,
} from './dto/performance.dto';
@Injectable()
export class PerformanceService {
  constructor(private readonly prisma: PrismaService) {}
  async createQRCode(showId: number, dto: CreatePerformanceQRCodeDto, userId: number) {
    const show = await this.prisma.show.findUnique({ where: { id: showId } });
    if (!show) {
      throw new NotFoundException(`Show with ID ${showId} not found`);
    }
    const stage = await this.prisma.stage.findUnique({ where: { id: dto.stageId } });
    if (!stage) {
      throw new NotFoundException(`Stage with ID ${dto.stageId} not found`);
    }
    const existing = await this.prisma.performanceQRCode.findUnique({
      where: { showId_stageId: { showId, stageId: dto.stageId } },
    });
    if (existing) {
      throw new BadRequestException('QR code already exists for this show and stage');
    }
    const code = `SHOW${showId}-STAGE${dto.stageId}-${Date.now()}`;
    const qrCode = await this.prisma.performanceQRCode.create({
      data: {
        code,
        showId,
        stageId: dto.stageId,
        maxRegistrations: dto.maxRegistrations,
        registrationDeadline: dto.registrationDeadline,
        createdBy: userId,
      },
      include: {
        show: true,
        stage: { include: { location: true } },
      },
    });
    return qrCode;
  }
  async getShowQRCodes(showId: number) {
    return this.prisma.performanceQRCode.findMany({
      where: { showId },
      include: {
        show: true,
        stage: { include: { location: true } },
      },
    });
  }
  async scanQRCode(code: string) {
    const qrCode = await this.prisma.performanceQRCode.findUnique({
      where: { code },
      include: {
        show: true,
        stage: { include: { location: true } },
      },
    });
    if (!qrCode) {
      throw new NotFoundException('QR code not found');
    }
    await this.prisma.performanceQRCode.update({
      where: { id: qrCode.id },
      data: { scanCount: { increment: 1 } },
    });
    return qrCode;
  }
  async updateQRCode(
    id: number,
    data: Partial<{
      isActive: boolean;
      maxRegistrations: number;
      registrationDeadline: Date;
    }>,
  ) {
    const qrCode = await this.prisma.performanceQRCode.findUnique({ where: { id } });
    if (!qrCode) {
      throw new NotFoundException('QR code not found');
    }
    return this.prisma.performanceQRCode.update({
      where: { id },
      data,
    });
  }
  async deleteQRCode(id: number) {
    const qrCode = await this.prisma.performanceQRCode.findUnique({ where: { id } });
    if (!qrCode) {
      throw new NotFoundException('QR code not found');
    }
    return this.prisma.performanceQRCode.delete({ where: { id } });
  }
  async createRegistration(dto: CreatePerformanceRegistrationDto, userId?: number) {
    const qrCode = await this.prisma.performanceQRCode.findUnique({
      where: { id: dto.qrCodeId },
    });
    if (!qrCode) {
      throw new NotFoundException('QR code not found');
    }
    if (!qrCode.isActive) {
      throw new BadRequestException('QR code is no longer active');
    }
    if (qrCode.registrationDeadline && new Date(qrCode.registrationDeadline) < new Date()) {
      throw new BadRequestException('Registration deadline has passed');
    }
    if (qrCode.maxRegistrations && qrCode.registrationCount >= qrCode.maxRegistrations) {
      throw new BadRequestException('Maximum registrations reached');
    }
    if (!userId && (!dto.guestName || !dto.guestPhone)) {
      throw new BadRequestException('Guest name and phone are required');
    }
    const highestQueue = await this.prisma.performanceRegistration.findFirst({
      where: { showId: dto.showId },
      orderBy: { queueNumber: 'desc' },
      select: { queueNumber: true },
    });
    const nextQueueNumber = (highestQueue?.queueNumber || 0) + 1;
    const registration = await this.prisma.performanceRegistration.create({
      data: {
        showId: dto.showId,
        stageId: dto.stageId,
        qrCodeId: dto.qrCodeId,
        userId,
        queueNumber: nextQueueNumber,
        guestName: dto.guestName,
        guestEmail: dto.guestEmail,
        guestPhone: dto.guestPhone,
        performanceType: dto.performanceType,
        songTitle: dto.songTitle,
        artistName: dto.artistName,
        duration: dto.duration,
        description: dto.description,
      },
      include: {
        show: true,
        stage: { include: { location: true } },
      },
    });
    await this.prisma.performanceQRCode.update({
      where: { id: qrCode.id },
      data: { registrationCount: { increment: 1 } },
    });
    return registration;
  }
  async getRegistrations(filters: { showId: number; stageId?: number; status?: string }) {
    const where: any = { showId: filters.showId };
    if (filters.stageId) {
      where.stageId = filters.stageId;
    }
    if (filters.status && filters.status !== 'ALL') {
      where.status = filters.status;
    }
    return this.prisma.performanceRegistration.findMany({
      where,
      orderBy: { registeredAt: 'desc' },
      include: {
        show: true,
        stage: true,
      },
    });
  }
  async getRegistrationById(id: number) {
    const registration = await this.prisma.performanceRegistration.findUnique({
      where: { id },
      include: {
        show: true,
        stage: { include: { location: true } },
        slot: true,
      },
    });
    if (!registration) {
      throw new NotFoundException('Registration not found');
    }
    return registration;
  }
  async getUserRegistrations(userId: number) {
    return this.prisma.performanceRegistration.findMany({
      where: { userId },
      orderBy: { registeredAt: 'desc' },
      include: {
        show: true,
        stage: { include: { location: true } },
        slot: true,
      },
    });
  }
  async reviewRegistration(id: number, dto: ReviewRegistrationDto, reviewerId: number) {
    const registration = await this.prisma.performanceRegistration.findUnique({ where: { id } });
    if (!registration) {
      throw new NotFoundException('Registration not found');
    }
    return this.prisma.performanceRegistration.update({
      where: { id },
      data: {
        status: dto.status,
        reviewNote: dto.reviewNote,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      },
      include: {
        show: true,
        stage: true,
      },
    });
  }
  async assignSlot(
    registrationId: number,
    slotData: {
      startTime: Date;
      endTime: Date;
      slotOrder: number;
    },
  ) {
    const registration = await this.prisma.performanceRegistration.findUnique({
      where: { id: registrationId },
    });
    if (!registration) {
      throw new NotFoundException('Registration not found');
    }
    const existingSlot = await this.prisma.performanceSlot.findUnique({
      where: { registrationId },
    });
    if (existingSlot) {
      return this.prisma.performanceSlot.update({
        where: { registrationId },
        data: slotData,
      });
    }
    return this.prisma.performanceSlot.create({
      data: {
        registrationId,
        showId: registration.showId,
        stageId: registration.stageId,
        ...slotData,
      },
    });
  }
  async getPerformanceSchedule(showId: number, stageId?: number) {
    const where: any = { showId };
    if (stageId) {
      where.stageId = stageId;
    }
    return this.prisma.performanceSlot.findMany({
      where,
      orderBy: { slotOrder: 'asc' },
      include: {
        registration: {
          include: {
            show: true,
            stage: true,
          },
        },
      },
    });
  }
  async cancelRegistration(id: number, userId?: number) {
    const registration = await this.prisma.performanceRegistration.findUnique({
      where: { id },
      include: { show: true },
    });
    if (!registration) {
      throw new NotFoundException('Registration not found');
    }
    if (userId && registration.userId !== userId) {
      throw new BadRequestException('You can only cancel your own registration');
    }
    if (registration.status !== 'PENDING') {
      throw new BadRequestException('Can only cancel pending registrations');
    }
    const showStartTime = new Date(registration.show.performTime);
    const cancellationDeadline = new Date(showStartTime.getTime() - 30 * 60 * 1000);
    const now = new Date();
    if (now > cancellationDeadline) {
      throw new BadRequestException(
        'Cannot cancel registration less than 30 minutes before the show starts',
      );
    }
    const updated = await this.prisma.performanceRegistration.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    });
    await this.prisma.performanceQRCode.update({
      where: { id: registration.qrCodeId },
      data: { registrationCount: { decrement: 1 } },
    });
    return updated;
  }
  async getPublicQueue(showId: number) {
    const show = await this.prisma.show.findUnique({
      where: { id: showId },
      include: { stage: { include: { location: true } } },
    });
    if (!show) {
      throw new NotFoundException('Show not found');
    }
    const registrations = await this.prisma.performanceRegistration.findMany({
      where: {
        showId,
        status: { in: ['PENDING', 'APPROVED', 'PERFORMED'] },
      },
      orderBy: { queueNumber: 'asc' },
      select: {
        id: true,
        queueNumber: true,
        songTitle: true,
        artistName: true,
        performanceType: true,
        duration: true,
        status: true,
        guestName: true,
        registeredAt: true,
        performedAt: true,
      },
    });
    const currentPerformer = registrations.find((r) => r.status === 'PERFORMED' && !r.performedAt);
    const avgDuration = 5;
    const queue = registrations.map((reg, index) => {
      const waitingBefore = registrations
        .slice(0, index)
        .filter((r) => r.status === 'PENDING' || r.status === 'APPROVED').length;
      return {
        ...reg,
        performerName: reg.guestName
          ? `${reg.guestName.split(' ')[0]} ${reg.guestName.split(' ').pop()?.charAt(0) || ''}.`
          : reg.artistName || 'Anonymous',
        estimatedWaitMinutes: waitingBefore * avgDuration,
        isCurrentlyPerforming: currentPerformer?.id === reg.id,
      };
    });
    return {
      show: {
        id: show.id,
        title: show.title,
        performTime: show.performTime,
        stage: show.stage,
      },
      totalRegistrations: registrations.length,
      currentPerformer: currentPerformer
        ? {
            queueNumber: currentPerformer.queueNumber,
            songTitle: currentPerformer.songTitle,
          }
        : null,
      queue,
    };
  }
  async getQueuePosition(showId: number, registrationId: number) {
    const registration = await this.prisma.performanceRegistration.findFirst({
      where: { id: registrationId, showId },
    });
    if (!registration) {
      throw new NotFoundException('Registration not found');
    }
    if (registration.queueNumber === null) {
      throw new BadRequestException('Registration has no queue number assigned');
    }
    const ahead = await this.prisma.performanceRegistration.count({
      where: {
        showId,
        queueNumber: { lt: registration.queueNumber },
        status: { in: ['PENDING', 'APPROVED'] },
      },
    });
    const total = await this.prisma.performanceRegistration.count({
      where: {
        showId,
        status: { in: ['PENDING', 'APPROVED', 'PERFORMED'] },
      },
    });
    return {
      queueNumber: registration.queueNumber,
      position: ahead + 1,
      peopleAhead: ahead,
      totalInQueue: total,
      estimatedWaitMinutes: ahead * 5,
      status: registration.status,
    };
  }
  async updatePerformanceStatus(
    id: number,
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'PERFORMED',
    adminId: number,
  ) {
    const registration = await this.prisma.performanceRegistration.findUnique({ where: { id } });
    if (!registration) {
      throw new NotFoundException('Registration not found');
    }
    const updateData: any = {
      status,
      reviewedBy: adminId,
      reviewedAt: new Date(),
    };
    if (status === 'PERFORMED' && !registration.performedAt) {
      updateData.performedAt = new Date();
    }
    if (status === 'CANCELLED' && !registration.cancelledAt) {
      updateData.cancelledAt = new Date();
    }
    return this.prisma.performanceRegistration.update({
      where: { id },
      data: updateData,
      include: {
        show: true,
        stage: true,
      },
    });
  }
  async callNextPerformer(showId: number, adminId: number) {
    const nextUp = await this.prisma.performanceRegistration.findFirst({
      where: {
        showId,
        status: { in: ['PENDING', 'APPROVED'] },
      },
      orderBy: { queueNumber: 'asc' },
    });
    if (!nextUp) {
      throw new BadRequestException('No more performers in queue');
    }
    return this.updatePerformanceStatus(nextUp.id, 'PERFORMED', adminId);
  }
  async markNoShow(id: number, adminId: number) {
    const registration = await this.prisma.performanceRegistration.findUnique({ where: { id } });
    if (!registration) {
      throw new NotFoundException('Registration not found');
    }
    return this.prisma.performanceRegistration.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        reviewNote: 'No show - did not appear when called',
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    });
  }
  async reorderQueue(showId: number, registrationIds: number[]) {
    const updates = registrationIds.map((id, index) =>
      this.prisma.performanceRegistration.update({
        where: { id },
        data: { queueNumber: index + 1 },
      }),
    );
    await this.prisma.$transaction(updates);
    return this.getRegistrations({ showId });
  }
}
