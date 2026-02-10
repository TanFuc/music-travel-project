import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CreateTicketTierDto,
  UpdateTicketTierDto,
  TicketTierQueryDto,
} from './dto/ticket-tier.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TicketTiersService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // ADMIN OPERATIONS
  // ============================================================================

  async create(dto: CreateTicketTierDto, userId?: number) {
    return this.prisma.ticketTier.create({
      data: {
        name: dto.name,
        nameEn: dto.nameEn,
        price: dto.price,
        description: dto.description,
        benefits: dto.benefits,
        targetAudience: dto.targetAudience,
        colorCode: dto.colorCode,
        priority: dto.priority ?? 0,
        groupSize: dto.groupSize ?? 1,
        totalQuantity: dto.totalQuantity ?? 0,
        maxPerOrder: dto.maxPerOrder ?? 10,
        isActive: dto.isActive ?? true,
        createdBy: userId,
      },
    });
  }

  async findAll(query: TicketTierQueryDto) {
    const { page = 1, limit = 20, search, isActive } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.TicketTierWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [items, total] = await Promise.all([
      this.prisma.ticketTier.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.ticketTier.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const ticketTier = await this.prisma.ticketTier.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            bookingItems: true,
            cartItems: true,
          },
        },
      },
    });

    if (!ticketTier) {
      throw new NotFoundException('Không tìm thấy loại vé');
    }

    return ticketTier;
  }

  async update(id: number, dto: UpdateTicketTierDto, userId?: number) {
    const ticketTier = await this.prisma.ticketTier.findUnique({ where: { id } });
    if (!ticketTier) {
      throw new NotFoundException('Không tìm thấy loại vé');
    }

    return this.prisma.ticketTier.update({
      where: { id },
      data: {
        ...dto,
        updatedBy: userId,
      },
    });
  }

  async remove(id: number) {
    const ticketTier = await this.prisma.ticketTier.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            bookingItems: true,
          },
        },
      },
    });

    if (!ticketTier) {
      throw new NotFoundException('Không tìm thấy loại vé');
    }

    if (ticketTier._count.bookingItems > 0) {
      throw new BadRequestException(
        'Không thể xóa loại vé đã có đơn hàng. Hãy vô hiệu hóa thay vì xóa.',
      );
    }

    return this.prisma.ticketTier.delete({ where: { id } });
  }

  async toggleActive(id: number, userId?: number) {
    const ticketTier = await this.prisma.ticketTier.findUnique({ where: { id } });
    if (!ticketTier) {
      throw new NotFoundException('Không tìm thấy loại vé');
    }

    return this.prisma.ticketTier.update({
      where: { id },
      data: {
        isActive: !ticketTier.isActive,
        updatedBy: userId,
      },
    });
  }

  async updateStock(id: number, quantity: number, userId?: number) {
    const ticketTier = await this.prisma.ticketTier.findUnique({ where: { id } });
    if (!ticketTier) {
      throw new NotFoundException('Không tìm thấy loại vé');
    }

    if (quantity < ticketTier.soldCount) {
      throw new BadRequestException(
        `Số lượng không thể nhỏ hơn số vé đã bán (${ticketTier.soldCount})`,
      );
    }

    return this.prisma.ticketTier.update({
      where: { id },
      data: {
        totalQuantity: quantity,
        updatedBy: userId,
      },
    });
  }

  // ============================================================================
  // PUBLIC OPERATIONS
  // ============================================================================

  async findAllPublic() {
    const items = await this.prisma.ticketTier.findMany({
      where: { isActive: true },
      orderBy: [{ priority: 'asc' }, { price: 'asc' }],
      select: {
        id: true,
        name: true,
        nameEn: true,
        price: true,
        description: true,
        benefits: true,
        targetAudience: true,
        colorCode: true,
        priority: true,
        groupSize: true,
        totalQuantity: true,
        soldCount: true,
        maxPerOrder: true,
      },
    });

    // Calculate available quantity for each tier
    return items.map((item) => ({
      ...item,
      availableQuantity: Math.max(0, item.totalQuantity - item.soldCount),
      isSoldOut: item.totalQuantity > 0 && item.soldCount >= item.totalQuantity,
    }));
  }

  async findOnePublic(id: number) {
    const ticketTier = await this.prisma.ticketTier.findFirst({
      where: { id, isActive: true },
      select: {
        id: true,
        name: true,
        nameEn: true,
        price: true,
        description: true,
        benefits: true,
        targetAudience: true,
        colorCode: true,
        priority: true,
        groupSize: true,
        totalQuantity: true,
        soldCount: true,
        maxPerOrder: true,
      },
    });

    if (!ticketTier) {
      throw new NotFoundException('Không tìm thấy loại vé');
    }

    return {
      ...ticketTier,
      availableQuantity: Math.max(0, ticketTier.totalQuantity - ticketTier.soldCount),
      isSoldOut: ticketTier.totalQuantity > 0 && ticketTier.soldCount >= ticketTier.totalQuantity,
    };
  }

  // ============================================================================
  // INVENTORY OPERATIONS
  // ============================================================================

  async checkAvailability(ticketTierId: number, quantity: number) {
    const ticketTier = await this.prisma.ticketTier.findUnique({
      where: { id: ticketTierId },
    });

    if (!ticketTier) {
      throw new NotFoundException('Không tìm thấy loại vé');
    }

    if (!ticketTier.isActive) {
      throw new BadRequestException('Loại vé này không còn hoạt động');
    }

    const available = ticketTier.totalQuantity - ticketTier.soldCount;

    if (ticketTier.totalQuantity > 0 && quantity > available) {
      throw new BadRequestException(`Chỉ còn ${available} vé. Bạn không thể mua ${quantity} vé.`);
    }

    if (quantity > ticketTier.maxPerOrder) {
      throw new BadRequestException(
        `Tối đa ${ticketTier.maxPerOrder} vé mỗi đơn hàng cho loại vé này.`,
      );
    }

    return {
      isAvailable: true,
      ticketTier,
      requestedQuantity: quantity,
      availableQuantity: available,
    };
  }

  async reserveTickets(ticketTierId: number, quantity: number) {
    // Check availability first
    await this.checkAvailability(ticketTierId, quantity);

    // Update sold count
    return this.prisma.ticketTier.update({
      where: { id: ticketTierId },
      data: {
        soldCount: { increment: quantity },
      },
    });
  }

  async releaseTickets(ticketTierId: number, quantity: number) {
    const ticketTier = await this.prisma.ticketTier.findUnique({
      where: { id: ticketTierId },
    });

    if (!ticketTier) {
      throw new NotFoundException('Không tìm thấy loại vé');
    }

    const newSoldCount = Math.max(0, ticketTier.soldCount - quantity);

    return this.prisma.ticketTier.update({
      where: { id: ticketTierId },
      data: {
        soldCount: newSoldCount,
      },
    });
  }

  // ============================================================================
  // STATISTICS
  // ============================================================================

  async getStatistics() {
    const tiers = await this.prisma.ticketTier.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        price: true,
        totalQuantity: true,
        soldCount: true,
        groupSize: true,
      },
    });

    const totalRevenue = tiers.reduce((sum, tier) => {
      return sum + Number(tier.price) * tier.soldCount;
    }, 0);

    const totalSold = tiers.reduce((sum, tier) => sum + tier.soldCount, 0);
    const totalCapacity = tiers.reduce((sum, tier) => sum + tier.totalQuantity, 0);
    const totalPeople = tiers.reduce((sum, tier) => sum + tier.soldCount * tier.groupSize, 0);

    return {
      tiers: tiers.map((tier) => ({
        ...tier,
        availableQuantity: tier.totalQuantity - tier.soldCount,
        revenue: Number(tier.price) * tier.soldCount,
        peopleCount: tier.soldCount * tier.groupSize,
      })),
      summary: {
        totalTiers: tiers.length,
        totalCapacity,
        totalSold,
        totalAvailable: totalCapacity - totalSold,
        totalRevenue,
        totalPeople,
        soldPercentage: totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0,
      },
    };
  }
}
