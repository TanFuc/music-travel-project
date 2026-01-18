import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreatePerformanceQRCodeDto, CreatePerformanceRegistrationDto, ReviewRegistrationDto } from './dto/performance.dto';

@Injectable()
export class PerformanceService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // QR CODE MANAGEMENT
  // ============================================================================

  async createQRCode(showId: number, dto: CreatePerformanceQRCodeDto, userId: number) {
    // Validate show exists
    const show = await this.prisma.show.findUnique({ where: { id: showId } });
    if (!show) {
      throw new NotFoundException(`Show with ID ${showId} not found`);
    }

    // Validate stage exists
    const stage = await this.prisma.stage.findUnique({ where: { id: dto.stageId } });
    if (!stage) {
      throw new NotFoundException(`Stage with ID ${dto.stageId} not found`);
    }

    // Check if QR code already exists for this show + stage
    const existing = await this.prisma.performanceQRCode.findUnique({
      where: { showId_stageId: { showId, stageId: dto.stageId } },
    });

    if (existing) {
      throw new BadRequestException('QR code already exists for this show and stage');
    }

    // Generate unique code
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

    // Increment scan count
    await this.prisma.performanceQRCode.update({
      where: { id: qrCode.id },
      data: { scanCount: { increment: 1 } },
    });

    return qrCode;
  }

  async updateQRCode(id: number, data: Partial<{ isActive: boolean; maxRegistrations: number; registrationDeadline: Date }>) {
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

  // ============================================================================
  // REGISTRATION MANAGEMENT
  // ============================================================================

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

    // Check registration deadline
    if (qrCode.registrationDeadline && new Date(qrCode.registrationDeadline) < new Date()) {
      throw new BadRequestException('Registration deadline has passed');
    }

    // Check max registrations
    if (qrCode.maxRegistrations && qrCode.registrationCount >= qrCode.maxRegistrations) {
      throw new BadRequestException('Maximum registrations reached');
    }

    // Validate guest info if not logged in
    if (!userId && (!dto.guestName || !dto.guestPhone)) {
      throw new BadRequestException('Guest name and phone are required');
    }

    // Create registration
    const registration = await this.prisma.performanceRegistration.create({
      data: {
        showId: dto.showId,
        stageId: dto.stageId,
        qrCodeId: dto.qrCodeId,
        userId,
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

    // Increment registration count
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

  async assignSlot(registrationId: number, slotData: { startTime: Date; endTime: Date; slotOrder: number }) {
    const registration = await this.prisma.performanceRegistration.findUnique({
      where: { id: registrationId },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    // Check if slot already exists
    const existingSlot = await this.prisma.performanceSlot.findUnique({
      where: { registrationId },
    });

    if (existingSlot) {
      // Update existing slot
      return this.prisma.performanceSlot.update({
        where: { registrationId },
        data: slotData,
      });
    }

    // Create new slot
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
    const registration = await this.prisma.performanceRegistration.findUnique({ where: { id } });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    // Check ownership if user is provided
    if (userId && registration.userId !== userId) {
      throw new BadRequestException('You can only cancel your own registration');
    }

    // Only allow cancellation if pending
    if (registration.status !== 'PENDING') {
      throw new BadRequestException('Can only cancel pending registrations');
    }

    // Update registration status
    const updated = await this.prisma.performanceRegistration.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    // Decrement registration count
    await this.prisma.performanceQRCode.update({
      where: { id: registration.qrCodeId },
      data: { registrationCount: { decrement: 1 } },
    });

    return updated;
  }
}
