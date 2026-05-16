import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { BannerPosition } from '@prisma/client';
import { CacheService } from '@/cache/cache.service';
import { CacheKeys, CACHE_TTL } from '@/cache/cache-keys.constant';
@Injectable()
export class BannersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}
  async findByPosition(position: BannerPosition) {
    const cacheKey = CacheKeys.bannersByPosition(position);
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    const now = new Date();
    const banners = await this.prisma.banner.findMany({
      where: {
        position,
        isActive: true,
        OR: [
          { startTime: null, endTime: null },
          {
            startTime: { lte: now },
            endTime: { gte: now },
          },
          {
            startTime: { lte: now },
            endTime: null,
          },
          {
            startTime: null,
            endTime: { gte: now },
          },
        ],
      },
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        mobileImageUrl: true,
        actionLink: true,
        location: true,
        date: true,
        position: true,
        displayOrder: true,
      },
    });
    await this.cache.set(cacheKey, banners, CACHE_TTL.MEDIUM);
    return banners;
  }
  async findAll() {
    return this.prisma.banner.findMany({
      orderBy: [{ position: 'asc' }, { displayOrder: 'asc' }],
    });
  }
  async findById(id: number) {
    return this.prisma.banner.findUnique({
      where: { id },
    });
  }
  async create(data: {
    title?: string;
    imageUrl: string;
    mobileImageUrl?: string;
    actionLink?: string;
    location?: string;
    date?: string;
    position: BannerPosition;
    displayOrder?: number;
    isActive?: boolean;
    startTime?: Date;
    endTime?: Date;
    createdBy?: number;
  }) {
    const banner = await this.prisma.banner.create({ data });
    await this.cache.del(CacheKeys.bannersByPosition(data.position));
    return banner;
  }
  async update(
    id: number,
    data: {
      title?: string;
      imageUrl?: string;
      mobileImageUrl?: string;
      actionLink?: string;
      location?: string;
      date?: string;
      position?: BannerPosition;
      displayOrder?: number;
      isActive?: boolean;
      startTime?: Date;
      endTime?: Date;
      updatedBy?: number;
    },
  ) {
    const banner = await this.prisma.banner.update({
      where: { id },
      data,
    });
    await this.invalidateBannerCacheImmediate();
    return banner;
  }
  async delete(id: number) {
    await this.prisma.banner.delete({ where: { id } });
    await this.invalidateBannerCacheImmediate();
  }
  private async invalidateBannerCache() {
    const positions = Object.values(BannerPosition);
    for (const position of positions) {
      await this.cache.del(CacheKeys.bannersByPosition(position));
    }
  }
  private async invalidateBannerCacheImmediate() {
    const positions = Object.values(BannerPosition);
    for (const position of positions) {
      const key = CacheKeys.bannersByPosition(position);
      await this.cache.del(key);
    }
    try {
      await this.cache.flushAll();
    } catch (error) {}
  }
}
