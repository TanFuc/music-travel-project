import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateSeatMapTemplateDto,
  UpdateSeatMapTemplateDto,
  UpdateStageSeatMapDto,
  SeatMapConfig,
} from './dto/seat-map.dto';
import { SeatType } from '@prisma/client';
@Injectable()
export class SeatMapsService {
  constructor(private prisma: PrismaService) {}
  async getAllTemplates(isPublic?: boolean) {
    return this.prisma.seatMapTemplate.findMany({
      where: isPublic !== undefined ? { isPublic } : {},
      orderBy: { createdAt: 'desc' },
    });
  }
  async getTemplateById(id: number) {
    const template = await this.prisma.seatMapTemplate.findUnique({
      where: { id },
    });
    if (!template) {
      throw new NotFoundException(`Template với ID ${id} không tồn tại`);
    }
    return template;
  }
  async createTemplate(dto: CreateSeatMapTemplateDto, userId: number) {
    return this.prisma.seatMapTemplate.create({
      data: {
        name: dto.name,
        description: dto.description,
        config: dto.config as any,
        thumbnail: dto.thumbnail,
        isPublic: dto.isPublic ?? true,
        createdBy: userId,
      },
    });
  }
  async updateTemplate(id: number, dto: UpdateSeatMapTemplateDto) {
    await this.getTemplateById(id);
    return this.prisma.seatMapTemplate.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        config: dto.config as any,
        thumbnail: dto.thumbnail,
        isPublic: dto.isPublic,
      },
    });
  }
  async deleteTemplate(id: number) {
    await this.getTemplateById(id);
    const stagesUsingTemplate = await this.prisma.stage.count({
      where: { seatMapTemplate: id },
    });
    if (stagesUsingTemplate > 0) {
      throw new BadRequestException(
        `Không thể xóa template này vì đang có ${stagesUsingTemplate} sân khấu đang sử dụng`,
      );
    }
    return this.prisma.seatMapTemplate.delete({
      where: { id },
    });
  }
  async getStageSeatMap(stageId: number) {
    const stage = await this.prisma.stage.findUnique({
      where: { id: stageId },
      include: {
        template: true,
        physicalSeats: {
          orderBy: [{ zoneName: 'asc' }, { rowName: 'asc' }, { seatNumber: 'asc' }],
        },
      },
    });
    if (!stage) {
      throw new NotFoundException(`Sân khấu với ID ${stageId} không tồn tại`);
    }
    return {
      stage: {
        id: stage.id,
        name: stage.name,
        seatMapConfig: stage.seatMapConfig,
        template: stage.template,
      },
      physicalSeats: stage.physicalSeats,
    };
  }
  async applyTemplateToStage(stageId: number, templateId: number, userId: number) {
    const template = await this.getTemplateById(templateId);
    const stage = await this.prisma.stage.findUnique({
      where: { id: stageId },
    });
    if (!stage) {
      throw new NotFoundException(`Sân khấu với ID ${stageId} không tồn tại`);
    }
    await this.prisma.stage.update({
      where: { id: stageId },
      data: {
        seatMapTemplate: templateId,
        seatMapConfig: template.config as any,
        updatedBy: userId,
      },
    });
    await this.generatePhysicalSeatsFromConfig(stageId, template.config as any);
    return { message: 'Áp dụng template thành công' };
  }
  async updateStageSeatMap(stageId: number, dto: UpdateStageSeatMapDto, userId: number) {
    const stage = await this.prisma.stage.findUnique({
      where: { id: stageId },
    });
    if (!stage) {
      throw new NotFoundException(`Sân khấu với ID ${stageId} không tồn tại`);
    }
    await this.prisma.stage.update({
      where: { id: stageId },
      data: {
        seatMapConfig: dto.seatMapConfig as any,
        seatMapTemplate: dto.seatMapTemplateId,
        updatedBy: userId,
      },
    });
    if (dto.seatMapConfig) {
      await this.generatePhysicalSeatsFromConfig(stageId, dto.seatMapConfig);
    }
    return { message: 'Cập nhật sơ đồ chỗ ngồi thành công' };
  }
  private async generatePhysicalSeatsFromConfig(stageId: number, config: SeatMapConfig) {
    await this.prisma.physicalSeat.deleteMany({
      where: { stageId },
    });
    const seatsToCreate = [];
    for (const zone of config.zones) {
      for (const row of zone.rows) {
        for (const seat of row.seats) {
          if (seat.status !== 'disabled') {
            seatsToCreate.push({
              stageId,
              zoneName: zone.name,
              rowName: row.rowName,
              seatNumber: seat.seatNumber,
              type: zone.type === 'STANDING' ? SeatType.STANDING : SeatType.SEAT,
              xPosition: Math.round(seat.x),
              yPosition: Math.round(seat.y),
            });
          }
        }
      }
    }
    if (seatsToCreate.length > 0) {
      await this.prisma.physicalSeat.createMany({
        data: seatsToCreate,
      });
    }
    return seatsToCreate.length;
  }
  async getPresetTemplates() {
    return [
      {
        name: 'Nhỏ - 100 chỗ',
        description: 'Phù hợp cho venue nhỏ, intimate',
        config: this.generateSmallVenueTemplate(),
      },
      {
        name: 'Trung bình - 250 chỗ',
        description: 'Phù hợp cho venue quy mô vừa',
        config: this.generateMediumVenueTemplate(),
      },
      {
        name: 'Lớn - 500 chỗ',
        description: 'Phù hợp cho sân khấu lớn, concert',
        config: this.generateLargeVenueTemplate(),
      },
      {
        name: 'Standing Only',
        description: 'Toàn khu vực standing cho nhạc điện tử',
        config: this.generateStandingOnlyTemplate(),
      },
    ];
  }
  private generateSmallVenueTemplate(): SeatMapConfig {
    return {
      width: 800,
      height: 600,
      zones: [
        {
          id: 'vip',
          name: 'VIP',
          type: 'SEAT',
          color: '#FFD700',
          rows: this.generateRows('VIP', 2, 10, 50, 100, 40),
        },
        {
          id: 'standard',
          name: 'Standard',
          type: 'SEAT',
          color: '#4CAF50',
          rows: this.generateRows('Standard', 4, 15, 50, 200, 40),
        },
      ],
    };
  }
  private generateMediumVenueTemplate(): SeatMapConfig {
    return {
      width: 1000,
      height: 800,
      zones: [
        {
          id: 'vip',
          name: 'VIP',
          type: 'SEAT',
          color: '#FFD700',
          rows: this.generateRows('VIP', 3, 12, 50, 100, 35),
        },
        {
          id: 'standard',
          name: 'Standard',
          type: 'SEAT',
          color: '#4CAF50',
          rows: this.generateRows('Standard', 5, 18, 50, 220, 35),
        },
        {
          id: 'standing',
          name: 'Standing',
          type: 'STANDING',
          color: '#2196F3',
          rows: this.generateRows('Standing', 2, 20, 50, 400, 35),
        },
      ],
    };
  }
  private generateLargeVenueTemplate(): SeatMapConfig {
    return {
      width: 1200,
      height: 1000,
      zones: [
        {
          id: 'vip',
          name: 'VIP',
          type: 'SEAT',
          color: '#FFD700',
          rows: this.generateRows('VIP', 4, 15, 50, 100, 35),
        },
        {
          id: 'standard',
          name: 'Standard',
          type: 'SEAT',
          color: '#4CAF50',
          rows: this.generateRows('Standard', 6, 20, 50, 250, 35),
        },
        {
          id: 'standing',
          name: 'Standing',
          type: 'STANDING',
          color: '#2196F3',
          rows: this.generateRows('Standing', 3, 25, 50, 500, 35),
        },
      ],
    };
  }
  private generateStandingOnlyTemplate(): SeatMapConfig {
    return {
      width: 1000,
      height: 800,
      zones: [
        {
          id: 'standing',
          name: 'Standing',
          type: 'STANDING',
          color: '#2196F3',
          rows: this.generateRows('Standing', 5, 30, 50, 100, 30),
        },
      ],
    };
  }
  private generateRows(
    zoneName: string,
    numRows: number,
    seatsPerRow: number,
    startX: number,
    startY: number,
    spacing: number,
  ) {
    const rows = [];
    for (let r = 0; r < numRows; r++) {
      const rowName = String.fromCharCode(65 + r);
      const seats = [];
      for (let s = 0; s < seatsPerRow; s++) {
        seats.push({
          id: `${zoneName}-${rowName}-${s + 1}`,
          seatNumber: (s + 1).toString(),
          x: startX + s * spacing,
          y: startY + r * spacing,
          width: 30,
          height: 30,
          status: 'available' as const,
        });
      }
      rows.push({
        id: `${zoneName}-${rowName}`,
        rowName,
        seats,
      });
    }
    return rows;
  }
}
