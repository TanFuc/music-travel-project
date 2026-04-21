import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { WishlistTargetType } from '@prisma/client';
import { ToggleWishlistDto } from './dto/toggle-wishlist.dto';
@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}
  async toggleWishlist(userId: number, dto: ToggleWishlistDto) {
    const { targetType, targetId } = dto;
    if (targetType === WishlistTargetType.SHOW) {
      const show = await this.prisma.show.findUnique({ where: { id: targetId } });
      if (!show) throw new NotFoundException('Show not found');
    } else if (targetType === WishlistTargetType.TOUR) {
      const tour = await this.prisma.tour.findUnique({ where: { id: targetId } });
      if (!tour) throw new NotFoundException('Tour not found');
    } else {
      throw new BadRequestException('Invalid target type');
    }
    const existing = await this.prisma.wishlist.findUnique({
      where: {
        userId_targetType_targetId: {
          userId,
          targetType,
          targetId,
        },
      },
    });
    if (existing) {
      await this.prisma.wishlist.delete({
        where: {
          userId_targetType_targetId: {
            userId,
            targetType,
            targetId,
          },
        },
      });
      return { isWishlisted: false };
    } else {
      await this.prisma.wishlist.create({
        data: {
          userId,
          targetType,
          targetId,
        },
      });
      return { isWishlisted: true };
    }
  }
  async getMyWishlist(userId: number) {
    const wishlist = await this.prisma.wishlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    if (!wishlist.length) return [];
    const showIds = wishlist
      .filter((item) => item.targetType === WishlistTargetType.SHOW)
      .map((item) => item.targetId);
    const tourIds = wishlist
      .filter((item) => item.targetType === WishlistTargetType.TOUR)
      .map((item) => item.targetId);
    const [shows, tours] = await Promise.all([
      this.prisma.show.findMany({
        where: { id: { in: showIds } },
        select: {
          id: true,
          title: true,
          slug: true,
          properties: true,
          performTime: true,
          status: true,
          stage: {
            select: {
              name: true,
              location: { select: { name: true } },
            },
          },
          ticketClasses: {
            select: { price: true },
            orderBy: { price: 'asc' },
            take: 1,
          },
        },
      }),
      this.prisma.tour.findMany({
        where: { id: { in: tourIds } },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          duration: true,
          properties: true,
          schedules: {
            select: { price: true, startDate: true },
            orderBy: { price: 'asc' },
            take: 1,
          },
        },
      }),
    ]);
    return wishlist.map((item) => {
      let details: any = null;
      if (item.targetType === WishlistTargetType.SHOW) {
        const show = shows.find((s) => s.id === item.targetId);
        if (show) {
          const props = show.properties as any;
          details = { ...show, thumbnailUrl: props?.thumbnailUrl || null };
        }
      } else if (item.targetType === WishlistTargetType.TOUR) {
        const tour = tours.find((t) => t.id === item.targetId);
        const props = tour?.properties as Record<string, any> | null;
        const bannerUrl = props?.bannerUrl || null;
        details = tour ? { ...tour, bannerUrl } : null;
      }
      return {
        ...item,
        details,
      };
    });
  }
  async checkStatus(userId: number, targetType: WishlistTargetType, targetId: number) {
    const existing = await this.prisma.wishlist.findUnique({
      where: {
        userId_targetType_targetId: {
          userId,
          targetType,
          targetId,
        },
      },
    });
    return { isWishlisted: !!existing };
  }
}
