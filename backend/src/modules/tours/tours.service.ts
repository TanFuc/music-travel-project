import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { TourFilterDto } from './dto/tour-filter.dto';
import { getPaginationParams, paginate } from '@/common/utils/pagination.util';
import { ERROR_CODES, getErrorMessage } from '@/common/constants/error-codes.constant';
import { CacheService } from '@/cache/cache.service';
import { CacheKeys, CachePatterns, CACHE_TTL, generateFilterHash } from '@/cache/cache-keys.constant';

@Injectable()
export class ToursService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async findAll(filterDto: TourFilterDto) {
    // Generate cache key from filters
    const filterHash = generateFilterHash({
      page: filterDto.page,
      limit: filterDto.limit,
      search: filterDto.search,
      destinationId: filterDto.destinationId,
    });
    const cacheKey = CacheKeys.tourList(filterHash);

    // Try to get from cache
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const { skip, take } = getPaginationParams(filterDto);

    const where = {
      deletedAt: null,
      ...(filterDto.search && {
        OR: [
          { title: { contains: filterDto.search } },
          { description: { contains: filterDto.search } },
        ],
      }),
      ...(filterDto.destinationId && { destinationLocId: filterDto.destinationId }),
    };

    const [tours, total] = await Promise.all([
      this.prisma.tour.findMany({
        where,
        include: {
          departureLoc: true,
          destinationLoc: true,
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

    const formattedTours = tours.map((tour) => ({
      id: tour.id,
      title: tour.title,
      slug: tour.slug,
      duration: tour.duration,
      departureLoc: tour.departureLoc,
      destinationLoc: tour.destinationLoc,
      minPrice: tour.schedules.length
        ? Math.min(...tour.schedules.map((s) => Number(s.price)))
        : null,
      nextSchedule: tour.schedules[0] || null,
    }));

    const result = paginate(formattedTours, total, filterDto.page || 1, filterDto.limit || 10);

    // Cache tour list for 10 minutes
    await this.cache.set(cacheKey, result, CACHE_TTL.MEDIUM);

    return result;
  }

  async findBySlug(slug: string) {
    const cacheKey = CacheKeys.tourBySlug(slug);

    // Try to get from cache
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const tour = await this.prisma.tour.findFirst({
      where: { slug, deletedAt: null },
      include: {
        departureLoc: true,
        destinationLoc: true,
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

    if (!tour) {
      throw new NotFoundException({
        code: ERROR_CODES.TOUR_001,
        message: getErrorMessage(ERROR_CODES.TOUR_001),
      });
    }

    // Cache tour detail for 30 minutes
    await this.cache.set(cacheKey, tour, CACHE_TTL.STANDARD);

    return tour;
  }

  async getSchedules(tourId: number) {
    const cacheKey = CacheKeys.tourSchedules(tourId);

    // Try to get from cache
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const tour = await this.prisma.tour.findFirst({
      where: { id: tourId, deletedAt: null },
    });

    if (!tour) {
      throw new NotFoundException({
        code: ERROR_CODES.TOUR_001,
        message: getErrorMessage(ERROR_CODES.TOUR_001),
      });
    }

    const schedules = await this.prisma.tourSchedule.findMany({
      where: {
        tourId,
        status: 'OPEN',
        deletedAt: null,
      },
      orderBy: { startDate: 'asc' },
    });

    // Cache schedules for 5 minutes (availability changes)
    await this.cache.set(cacheKey, schedules, CACHE_TTL.SHORT);

    return schedules;
  }

  async create(createTourDto: CreateTourDto) {
    const slug = this.generateSlug(createTourDto.title);

    const tour = await this.prisma.tour.create({
      data: {
        title: createTourDto.title,
        slug,
        description: createTourDto.description,
        duration: createTourDto.duration,
        departureLocId: createTourDto.departureLocId,
        destinationLocId: createTourDto.destinationLocId,
        properties: createTourDto.properties as object | undefined,
        metaTitle: createTourDto.metaTitle,
        metaDescription: createTourDto.metaDescription,
      },
    });

    // Invalidate tour list caches
    await this.cache.delPattern(CachePatterns.tourLists());

    return tour;
  }

  async update(id: number, updateTourDto: UpdateTourDto, updatedBy: number) {
    const existingTour = await this.findById(id);

    // Build update data
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
    if (updateTourDto.properties !== undefined) {
      updateData.properties = updateTourDto.properties;
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

    const updatedTour = await this.prisma.tour.update({
      where: { id },
      data: updateData,
      include: {
        departureLoc: true,
        destinationLoc: true,
      },
    });

    // Invalidate caches
    await this.invalidateTourCache(id, existingTour.slug || undefined);

    return updatedTour;
  }

  async softDelete(id: number, deletedBy: number) {
    const existingTour = await this.findById(id);

    // Check if there are booked schedules
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
        message: 'Không thể xóa tour đã có người đặt. Vui lòng hủy lịch khởi hành thay vì xóa tour.',
      });
    }

    await this.prisma.tour.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: deletedBy,
      },
    });

    // Invalidate caches
    await this.invalidateTourCache(id, existingTour.slug || undefined);

    return { message: 'Đã xóa tour thành công.' };
  }

  async createSchedule(tourId: number, createScheduleDto: CreateScheduleDto) {
    // Verify tour exists
    await this.findById(tourId);

    const schedule = await this.prisma.tourSchedule.create({
      data: {
        tourId,
        startDate: new Date(createScheduleDto.startDate),
        price: createScheduleDto.price,
        capacity: createScheduleDto.capacity,
        bookedCount: 0,
        status: 'OPEN',
      },
    });

    // Invalidate tour schedule cache
    await this.cache.del(CacheKeys.tourSchedules(tourId));

    return schedule;
  }

  private async findById(id: number) {
    const tour = await this.prisma.tour.findFirst({
      where: { id, deletedAt: null },
    });

    if (!tour) {
      throw new NotFoundException({
        code: ERROR_CODES.TOUR_001,
        message: getErrorMessage(ERROR_CODES.TOUR_001),
      });
    }

    return tour;
  }

  async checkScheduleAvailability(scheduleId: number, quantity: number): Promise<boolean> {
    const schedule = await this.prisma.tourSchedule.findFirst({
      where: {
        id: scheduleId,
        status: 'OPEN',
        deletedAt: null,
      },
    });

    if (!schedule) {
      throw new NotFoundException({
        code: ERROR_CODES.TOUR_001,
        message: getErrorMessage(ERROR_CODES.TOUR_001),
      });
    }

    const availableSlots = schedule.capacity - schedule.bookedCount;
    if (availableSlots < quantity) {
      throw new BadRequestException({
        code: ERROR_CODES.TOUR_002,
        message: getErrorMessage(ERROR_CODES.TOUR_002),
      });
    }

    return true;
  }

  /**
   * Invalidate all caches related to a specific tour
   */
  async invalidateTourCache(tourId: number, slug?: string) {
    const keysToDelete = [
      CacheKeys.tour(tourId),
      CacheKeys.tourSchedules(tourId),
    ];

    if (slug) {
      keysToDelete.push(CacheKeys.tourBySlug(slug));
    }

    await this.cache.delMany(keysToDelete);
    await this.cache.delPattern(CachePatterns.tourLists());
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
