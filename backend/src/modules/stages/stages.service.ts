import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CacheService } from '@/cache/cache.service';
import { CacheKeys, CACHE_TTL } from '@/cache/cache-keys.constant';
import { ERROR_CODES, getErrorMessage } from '@/common/constants/error-codes.constant';

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
      activeShowCount: stage._count.shows,
    }));

    await this.cache.set(cacheKey, result, CACHE_TTL.MEDIUM);

    return result;
  }

  async findBySlug(slug: string) {
    // First find by name since we don't have slug in Stage model
    const stage = await this.prisma.stage.findFirst({
      where: { deletedAt: null },
      include: {
        location: true,
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
}
