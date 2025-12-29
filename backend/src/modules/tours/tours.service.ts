import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateTourDto } from './dto/create-tour.dto';
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
