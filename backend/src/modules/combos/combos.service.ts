import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateTourDto } from '../tours/dto/create-tour.dto';
import { UpdateTourDto } from '../tours/dto/update-tour.dto';
import { CreateScheduleDto } from '../tours/dto/create-schedule.dto';
import { TourFilterDto } from '../tours/dto/tour-filter.dto';
import { getPaginationParams, paginate } from '@/common/utils/pagination.util';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';
import { CacheService } from '@/cache/cache.service';
import { CACHE_TTL, generateFilterHash } from '@/cache/cache-keys.constant';
@Injectable()
export class CombosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}
  async findAll(filterDto: TourFilterDto) {
    const filterHash = generateFilterHash({
      page: filterDto.page,
      limit: filterDto.limit,
      search: filterDto.search,
      destinationId: filterDto.destinationId,
      branchId: filterDto.branchId,
      location: filterDto.location,
      departure: filterDto.departure,
      destination: filterDto.destination,
      isCombo: true,
      type: 'COMBO',
    });
    const cacheKey = `combo_list_${filterHash}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    const { skip, take } = getPaginationParams(filterDto);
    const where = {
      deletedAt: null,
      isCombo: true,
      ...(filterDto.search && {
        OR: [
          { title: { contains: filterDto.search } },
          { description: { contains: filterDto.search } },
        ],
      }),
      ...(filterDto.destinationId && { destinationLocId: filterDto.destinationId }),
      ...(filterDto.location && {
        branch: {
          slug: filterDto.location,
        },
      }),
      ...(filterDto.departure && {
        departureLoc: {
          slug: filterDto.departure,
        },
      }),
      ...(filterDto.destination && {
        destinationLoc: {
          slug: filterDto.destination,
        },
      }),
      ...(filterDto.branchId && { branchId: filterDto.branchId }),
    };
    const [combos, total] = await Promise.all([
      this.prisma.tour.findMany({
        where,
        include: {
          departureLoc: true,
          destinationLoc: true,
          branch: true,
          linkedShow: true,
          schedules: {
            where: {
              status: 'OPEN',
              startDate: { gte: new Date() },
              deletedAt: null,
            },
            orderBy: { startDate: 'asc' },
            take: 3,
          },
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tour.count({ where }),
    ]);
    const formattedCombos = combos.map((combo) => {
      const comboProperties = (combo.properties as Record<string, unknown> | null) || null;
      const comboThumbnailUrl =
        (typeof comboProperties?.thumbnailUrl === 'string' && comboProperties.thumbnailUrl) ||
        (typeof comboProperties?.bannerUrl === 'string' && comboProperties.bannerUrl) ||
        null;
      const linkedShowProperties =
        (combo.linkedShow?.properties as Record<string, unknown> | null) || null;
      const linkedShowThumbnailUrl =
        (typeof linkedShowProperties?.thumbnailUrl === 'string' &&
          linkedShowProperties.thumbnailUrl) ||
        (typeof linkedShowProperties?.bannerUrl === 'string' && linkedShowProperties.bannerUrl) ||
        null;
      return {
        id: combo.id,
        title: combo.title,
        slug: combo.slug,
        thumbnailUrl: comboThumbnailUrl,
        duration: combo.duration,
        isCombo: combo.isCombo,
        departureLoc: combo.departureLoc,
        destinationLoc: combo.destinationLoc,
        linkedShow: combo.linkedShow
          ? {
              ...combo.linkedShow,
              thumbnailUrl: linkedShowThumbnailUrl,
            }
          : null,
        branch: combo.branch
          ? {
              id: combo.branch.id,
              name: combo.branch.name,
            }
          : null,
        minPrice: combo.schedules.length
          ? Math.min(...combo.schedules.map((s) => Number(s.price)))
          : null,
        nextSchedule: combo.schedules[0] || null,
      };
    });
    const result = paginate(formattedCombos, total, filterDto.page || 1, filterDto.limit || 10);
    await this.cache.set(cacheKey, result, CACHE_TTL.MEDIUM);
    return result;
  }
  async findBySlug(slug: string) {
    const cacheKey = `combo_slug_${slug}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    const combo = await this.prisma.tour.findFirst({
      where: { slug, isCombo: true, deletedAt: null },
      include: {
        departureLoc: true,
        destinationLoc: true,
        branch: true,
        linkedShow: true,
        schedules: {
          where: {
            status: 'OPEN',
            startDate: { gte: new Date() },
            deletedAt: null,
          },
          orderBy: { startDate: 'asc' },
        },
      },
    });
    if (!combo) {
      throw new NotFoundException({
        code: ERROR_CODES.TOUR_001,
        message: 'Combo không tồn tại',
      });
    }
    const comboProperties = (combo.properties as Record<string, unknown> | null) || null;
    const comboThumbnailUrl =
      (typeof comboProperties?.thumbnailUrl === 'string' && comboProperties.thumbnailUrl) ||
      (typeof comboProperties?.bannerUrl === 'string' && comboProperties.bannerUrl) ||
      null;
    const linkedShowProperties =
      (combo.linkedShow?.properties as Record<string, unknown> | null) || null;
    const linkedShowThumbnailUrl =
      (typeof linkedShowProperties?.thumbnailUrl === 'string' &&
        linkedShowProperties.thumbnailUrl) ||
      (typeof linkedShowProperties?.bannerUrl === 'string' && linkedShowProperties.bannerUrl) ||
      null;
    const result = {
      ...combo,
      thumbnailUrl: comboThumbnailUrl,
      linkedShow: combo.linkedShow
        ? {
            ...combo.linkedShow,
            thumbnailUrl: linkedShowThumbnailUrl,
          }
        : null,
    };
    await this.cache.set(cacheKey, result, CACHE_TTL.STANDARD);
    return result;
  }
  async getSchedules(comboId: number) {
    const cacheKey = `combo_schedules_${comboId}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    const combo = await this.prisma.tour.findFirst({
      where: { id: comboId, isCombo: true, deletedAt: null },
    });
    if (!combo) {
      throw new NotFoundException({
        code: ERROR_CODES.TOUR_001,
        message: 'Combo không tồn tại',
      });
    }
    const schedules = await this.prisma.tourSchedule.findMany({
      where: {
        tourId: comboId,
        status: 'OPEN',
        deletedAt: null,
      },
      orderBy: { startDate: 'asc' },
    });
    await this.cache.set(cacheKey, schedules, CACHE_TTL.SHORT);
    return schedules;
  }
  async create(createTourDto: CreateTourDto) {
    const slug = this.generateSlug(createTourDto.title);
    const combo = await this.prisma.tour.create({
      data: {
        title: createTourDto.title,
        slug,
        description: createTourDto.description,
        duration: createTourDto.duration,
        departureLocId: createTourDto.departureLocId,
        destinationLocId: createTourDto.destinationLocId,
        branchId: createTourDto.branchId,
        properties: createTourDto.properties as object | undefined,
        isCombo: true,
        linkedShowId: createTourDto.linkedShowId,
        minPrice: createTourDto.minPrice,
        metaTitle: createTourDto.metaTitle,
        metaDescription: createTourDto.metaDescription,
      },
    });
    await this.cache.delPattern('combo_list_*');
    return combo;
  }
  async update(id: number, updateTourDto: UpdateTourDto, updatedBy: number) {
    const existingCombo = await this.findById(id);
    const updateData: Record<string, unknown> = {
      updatedBy,
    };
    if (updateTourDto.title !== undefined) {
      updateData.title = updateTourDto.title;
      updateData.slug = this.generateSlug(updateTourDto.title);
    }
    if (updateTourDto.description !== undefined) {
      updateData.description = updateTourDto.description;
    }
    if (updateTourDto.duration !== undefined) {
      updateData.duration = updateTourDto.duration;
    }
    if (updateTourDto.departureLocId !== undefined) {
      updateData.departureLocId = updateTourDto.departureLocId;
    }
    if (updateTourDto.destinationLocId !== undefined) {
      updateData.destinationLocId = updateTourDto.destinationLocId;
    }
    if (updateTourDto.branchId !== undefined) {
      updateData.branchId = updateTourDto.branchId;
    }
    if (updateTourDto.properties !== undefined) {
      updateData.properties = updateTourDto.properties;
    }
    if (updateTourDto.minPrice !== undefined) {
      updateData.minPrice = updateTourDto.minPrice;
    }
    if (updateTourDto.linkedShowId !== undefined) {
      updateData.linkedShowId = updateTourDto.linkedShowId;
    }
    if (updateTourDto.metaTitle !== undefined) {
      updateData.metaTitle = updateTourDto.metaTitle;
    }
    if (updateTourDto.metaDescription !== undefined) {
      updateData.metaDescription = updateTourDto.metaDescription;
    }
    if (updateTourDto.metaKeywords !== undefined) {
      updateData.metaKeywords = updateTourDto.metaKeywords;
    }
    const updatedCombo = await this.prisma.tour.update({
      where: { id },
      data: updateData,
      include: {
        departureLoc: true,
        destinationLoc: true,
        branch: true,
        linkedShow: true,
      },
    });
    await this.invalidateComboCache(id, existingCombo.slug || undefined);
    return updatedCombo;
  }
  async softDelete(id: number, deletedBy: number) {
    const existingCombo = await this.findById(id);
    const bookedSchedules = await this.prisma.tourSchedule.findFirst({
      where: {
        tourId: id,
        bookedCount: { gt: 0 },
        deletedAt: null,
      },
    });
    if (bookedSchedules) {
      throw new BadRequestException({
        code: ERROR_CODES.TOUR_001,
        message: 'Không thể xóa combo đã có người đặt.',
      });
    }
    await this.prisma.tour.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: deletedBy,
      },
    });
    await this.invalidateComboCache(id, existingCombo.slug || undefined);
    return { message: 'Đã xóa combo thành công.' };
  }
  async createSchedule(comboId: number, createScheduleDto: CreateScheduleDto) {
    await this.findById(comboId);
    const schedule = await this.prisma.tourSchedule.create({
      data: {
        tourId: comboId,
        startDate: new Date(createScheduleDto.startDate),
        price: createScheduleDto.price,
        capacity: createScheduleDto.capacity,
        bookedCount: 0,
        status: 'OPEN',
      },
    });
    await this.cache.del(`combo_schedules_${comboId}`);
    return schedule;
  }
  private async findById(id: number) {
    const combo = await this.prisma.tour.findFirst({
      where: { id, isCombo: true, deletedAt: null },
    });
    if (!combo) {
      throw new NotFoundException({
        code: ERROR_CODES.TOUR_001,
        message: 'Combo không tồn tại',
      });
    }
    return combo;
  }
  async invalidateComboCache(comboId: number, slug?: string) {
    const keysToDelete = [`combo_${comboId}`, `combo_schedules_${comboId}`];
    if (slug) {
      keysToDelete.push(`combo_slug_${slug}`);
    }
    await this.cache.delMany(keysToDelete);
    await this.cache.delPattern('combo_list_*');
  }
  async getRelated(id: number) {
    const combo = await this.prisma.tour.findUnique({
      where: { id },
      include: {
        departureLoc: true,
        destinationLoc: true,
      },
    });
    if (!combo) return [];
    const relatedCombos = await this.prisma.tour.findMany({
      where: {
        id: { not: id },
        isCombo: true,
        deletedAt: null,
      },
      include: {
        departureLoc: true,
        destinationLoc: true,
        linkedShow: true,
        schedules: {
          where: {
            status: 'OPEN',
            startDate: { gte: new Date() },
            deletedAt: null,
          },
          orderBy: { startDate: 'asc' },
          take: 1,
        },
      },
      take: 8,
      orderBy: { createdAt: 'desc' },
    });
    const sorted = [...relatedCombos]
      .sort((a, b) => {
        const aMatch =
          a.destinationLocId === combo.destinationLocId ||
          a.departureLocId === combo.departureLocId;
        const bMatch =
          b.destinationLocId === combo.destinationLocId ||
          b.departureLocId === combo.departureLocId;
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
      })
      .slice(0, 4);
    return sorted.map((c) => {
      const comboProperties = (c.properties as Record<string, unknown> | null) || null;
      const comboThumbnailUrl =
        (typeof comboProperties?.thumbnailUrl === 'string' && comboProperties.thumbnailUrl) ||
        (typeof comboProperties?.bannerUrl === 'string' && comboProperties.bannerUrl) ||
        null;
      return {
        id: c.id,
        title: c.title,
        slug: c.slug,
        thumbnailUrl: comboThumbnailUrl,
        duration: c.duration,
        departureLoc: c.departureLoc,
        destinationLoc: c.destinationLoc,
        minPrice: c.schedules.length
          ? Math.min(...c.schedules.map((s) => Number(s.price)))
          : Number(c.minPrice) || null,
      };
    });
  }
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .concat('-', Date.now().toString(36));
  }
}
