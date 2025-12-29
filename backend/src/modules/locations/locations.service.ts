import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CacheService } from '@/cache/cache.service';
import { CacheKeys, CACHE_TTL } from '@/cache/cache-keys.constant';

@Injectable()
export class LocationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async findAll() {
    const cacheKey = CacheKeys.locations();

    // Try cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const locations = await this.prisma.location.findMany({
      where: { deletedAt: null },
      include: {
        stages: {
          where: { deletedAt: null },
          include: {
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
        },
      },
      orderBy: { name: 'asc' },
    });

    // Calculate show count per location
    const result = locations.map((location) => {
      const showCount = location.stages.reduce((sum, stage) => sum + stage._count.shows, 0);
      return {
        id: location.id,
        name: location.name,
        slug: location.slug,
        thumbnailUrl: location.thumbnailUrl,
        showCount,
      };
    });

    // Cache for 10 minutes
    await this.cache.set(cacheKey, result, CACHE_TTL.MEDIUM);

    return result;
  }

  async findBySlug(slug: string) {
    const cacheKey = CacheKeys.location(slug);

    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const location = await this.prisma.location.findFirst({
      where: { slug, deletedAt: null },
      include: {
        stages: {
          where: { deletedAt: null },
          include: {
            shows: {
              where: {
                status: 'UPCOMING',
                deletedAt: null,
              },
              take: 10,
              orderBy: { performTime: 'asc' },
            },
          },
        },
      },
    });

    if (location) {
      await this.cache.set(cacheKey, location, CACHE_TTL.STANDARD);
    }

    return location;
  }
}
