import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CacheService } from '@/cache/cache.service';
import { CacheKeys, CachePatterns, CACHE_TTL } from '@/cache/cache-keys.constant';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';
import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
@Injectable()
export class StagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}
  async findAll(locationId?: number) {
    const cacheKey = locationId ? CacheKeys.stagesByLocation(locationId) : CacheKeys.stages();
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    const stages = await this.prisma.stage.findMany({
      where: {
        deletedAt: null,
        ...(locationId && { locationId }),
      },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            shows: {
              where: {
                status: 'UPCOMING',
                deletedAt: null,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    const result = stages.map((stage) => ({
      id: stage.id,
      name: stage.name,
      address: stage.address,
      mapLink: stage.mapLink,
      location: stage.location,
      branch: stage.branch,
      activeShowCount: stage._count.shows,
    }));
    await this.cache.set(cacheKey, result, CACHE_TTL.MEDIUM);
    return result;
  }
  async findBySlug(_slug: string) {
    const stage = await this.prisma.stage.findFirst({
      where: { deletedAt: null },
      include: {
        location: true,
        branch: true,
        shows: {
          where: {
            status: 'UPCOMING',
            deletedAt: null,
          },
          include: {
            ticketClasses: {
              where: { deletedAt: null },
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
            artists: {
              include: {
                artist: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            _count: {
              select: {
                tickets: {
                  where: { status: 'AVAILABLE' },
                },
              },
            },
          },
          orderBy: { performTime: 'asc' },
        },
      },
    });
    if (!stage) {
      throw new NotFoundException({
        code: ERROR_CODES.SHOW_001,
        message: 'Sân khấu không tồn tại.',
      });
    }
    return {
      ...stage,
      shows: stage.shows.map((show) => ({
        id: show.id,
        title: show.title,
        slug: show.slug,
        performTime: show.performTime,
        status: show.status,
        minPrice: show.ticketClasses.length
          ? Math.min(...show.ticketClasses.map((tc) => Number(tc.price)))
          : null,
        availableTickets: show._count.tickets,
        artists: show.artists.map((sa) => ({
          ...sa.artist,
          isHeadline: sa.isHeadline,
        })),
      })),
    };
  }
  async create(createStageDto: CreateStageDto, userId?: number) {
    const location = await this.prisma.location.findUnique({
      where: { id: createStageDto.locationId },
    });
    if (!location) {
      throw new NotFoundException({
        code: ERROR_CODES.LOCATION_001,
        message: 'Địa điểm không tồn tại.',
      });
    }
    if (createStageDto.seatMapTemplate) {
      const template = await this.prisma.seatMapTemplate.findUnique({
        where: { id: createStageDto.seatMapTemplate },
      });
      if (!template) {
        throw new NotFoundException({
          code: ERROR_CODES.TEMPLATE_001,
          message: 'Template sơ đồ chỗ ngồi không tồn tại.',
        });
      }
    }
    if (createStageDto.branchId) {
      const branch = await this.prisma.branch.findUnique({
        where: { id: createStageDto.branchId },
      });
      if (!branch) {
        throw new NotFoundException({
          code: 'BRANCH_001',
          message: 'Chi nhánh không tồn tại.',
        });
      }
    }
    const stage = await this.prisma.stage.create({
      data: {
        locationId: createStageDto.locationId,
        name: createStageDto.name,
        address: createStageDto.address,
        latitude: createStageDto.latitude,
        longitude: createStageDto.longitude,
        mapLink: createStageDto.mapLink,
        seatMapConfig: createStageDto.seatMapConfig as any,
        seatMapTemplate: createStageDto.seatMapTemplate,
        branchId: createStageDto.branchId,
        createdBy: userId,
      },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
    await this.cache.delPattern(CachePatterns.stages());
    return stage;
  }
  async update(id: number, updateStageDto: UpdateStageDto, userId?: number) {
    const existingStage = await this.prisma.stage.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existingStage) {
      throw new NotFoundException({
        code: ERROR_CODES.STAGE_001,
        message: 'Sân khấu không tồn tại.',
      });
    }
    if (updateStageDto.locationId) {
      const location = await this.prisma.location.findUnique({
        where: { id: updateStageDto.locationId },
      });
      if (!location) {
        throw new NotFoundException({
          code: ERROR_CODES.LOCATION_001,
          message: 'Địa điểm không tồn tại.',
        });
      }
    }
    if (updateStageDto.seatMapTemplate) {
      const template = await this.prisma.seatMapTemplate.findUnique({
        where: { id: updateStageDto.seatMapTemplate },
      });
      if (!template) {
        throw new NotFoundException({
          code: ERROR_CODES.TEMPLATE_001,
          message: 'Template sơ đồ chỗ ngồi không tồn tại.',
        });
      }
    }
    if (updateStageDto.branchId) {
      const branch = await this.prisma.branch.findUnique({
        where: { id: updateStageDto.branchId },
      });
      if (!branch) {
        throw new NotFoundException({
          code: 'BRANCH_001',
          message: 'Chi nhánh không tồn tại.',
        });
      }
    }
    const stage = await this.prisma.stage.update({
      where: { id },
      data: {
        ...updateStageDto,
        seatMapConfig: updateStageDto.seatMapConfig as any,
        updatedBy: userId,
      },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
    await this.cache.delPattern(CachePatterns.stages());
    return stage;
  }
  async remove(id: number, userId?: number) {
    const stage = await this.prisma.stage.findFirst({
      where: { id, deletedAt: null },
    });
    if (!stage) {
      throw new NotFoundException({
        code: ERROR_CODES.STAGE_001,
        message: 'Sân khấu không tồn tại.',
      });
    }
    const showCount = await this.prisma.show.count({
      where: {
        stageId: id,
        deletedAt: null,
      },
    });
    if (showCount > 0) {
      throw new BadRequestException({
        code: ERROR_CODES.STAGE_002,
        message: 'Không thể xóa sân khấu đã có show.',
      });
    }
    await this.prisma.stage.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: userId,
      },
    });
    await this.cache.delPattern(CachePatterns.stages());
    return { message: 'Xóa sân khấu thành công.' };
  }
  async getPhysicalSeats(stageId: number, showId?: number) {
    const cacheKey = showId ? CacheKeys.showSeats(showId) : CacheKeys.stageSeats(stageId);
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    const stage = await this.prisma.stage.findFirst({
      where: { id: stageId, deletedAt: null },
    });
    if (!stage) {
      throw new NotFoundException({
        code: ERROR_CODES.STAGE_001,
        message: 'Sân khấu không tồn tại.',
      });
    }
    const seats = await this.prisma.physicalSeat.findMany({
      where: { stageId },
      orderBy: [{ zoneName: 'asc' }, { rowName: 'asc' }, { seatNumber: 'asc' }],
    });
    let result;
    if (showId) {
      const tickets = await this.prisma.ticket.findMany({
        where: {
          showId,
          physicalSeatId: { in: seats.map((s) => s.id) },
        },
        select: {
          physicalSeatId: true,
          status: true,
          ticketClassId: true,
        },
      });
      const ticketMap = new Map(tickets.map((t) => [t.physicalSeatId, t]));
      result = seats.map((seat) => {
        const ticket = ticketMap.get(seat.id);
        return {
          id: seat.id,
          stageId: seat.stageId,
          zoneName: seat.zoneName,
          rowName: seat.rowName,
          seatNumber: seat.seatNumber,
          type: seat.type,
          position: {
            x: seat.xPosition,
            y: seat.yPosition,
          },
          isAvailable: !ticket || ticket.status === 'AVAILABLE',
          status: ticket?.status || 'AVAILABLE',
          ticketClassId: ticket?.ticketClassId,
        };
      });
    } else {
      result = seats.map((seat) => ({
        id: seat.id,
        stageId: seat.stageId,
        zoneName: seat.zoneName,
        rowName: seat.rowName,
        seatNumber: seat.seatNumber,
        type: seat.type,
        position: {
          x: seat.xPosition,
          y: seat.yPosition,
        },
      }));
    }
    await this.cache.set(cacheKey, result, CACHE_TTL.MEDIUM);
    return result;
  }
}
