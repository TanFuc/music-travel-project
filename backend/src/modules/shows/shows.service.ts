import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ShowStatus } from '@prisma/client';
import { CreateShowDto } from './dto/create-show.dto';
import { UpdateShowDto } from './dto/update-show.dto';
import { ShowFilterDto } from './dto/show-filter.dto';
import { getPaginationParams, paginate } from '@/common/utils/pagination.util';
import { ERROR_CODES, getErrorMessage } from '@/common/constants/error-codes.constant';
import { CacheService } from '@/cache/cache.service';
import {
  CacheKeys,
  CachePatterns,
  CACHE_TTL,
  generateFilterHash,
} from '@/cache/cache-keys.constant';
@Injectable()
export class ShowsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}
  async findAll(filterDto: ShowFilterDto) {
    const filterHash = generateFilterHash({
      page: filterDto.page,
      limit: filterDto.limit,
      status: filterDto.status,
      stageId: filterDto.stageId,
      branchId: filterDto.branchId,
      search: filterDto.search,
      fromDate: filterDto.fromDate,
      toDate: filterDto.toDate,
      location: filterDto.location,
    });
    const cacheKey = CacheKeys.showList(filterHash);
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    const { skip, take } = getPaginationParams(filterDto);
    const where = {
      deletedAt: null,
      ...(filterDto.status && { status: filterDto.status }),
      ...(filterDto.stageId && { stageId: filterDto.stageId }),
      ...(filterDto.branchId && { branchId: filterDto.branchId }),
      ...(filterDto.search && {
        OR: [
          { title: { contains: filterDto.search } },
          { description: { contains: filterDto.search } },
        ],
      }),
      ...(filterDto.fromDate && {
        performTime: { gte: new Date(filterDto.fromDate) },
      }),
      ...(filterDto.toDate && {
        performTime: { lte: new Date(filterDto.toDate) },
      }),
      ...(filterDto.location && {
        OR: [
          {
            stage: {
              location: {
                slug: filterDto.location,
              },
            },
          },
          {
            linkedTours: {
              some: {
                OR: [
                  { departureLoc: { slug: filterDto.location } },
                  { destinationLoc: { slug: filterDto.location } },
                ],
              },
            },
          },
        ],
      }),
    };
    const [shows, total] = await Promise.all([
      this.prisma.show.findMany({
        where,
        include: {
          stage: {
            include: {
              location: true,
            },
          },
          branch: true,
          artists: {
            include: {
              artist: true,
            },
          },
          ticketClasses: {
            where: { deletedAt: null },
            select: {
              id: true,
              name: true,
              price: true,
              colorCode: true,
            },
          },
          linkedTours: {
            include: {
              departureLoc: true,
              destinationLoc: true,
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
        skip,
        take,
        orderBy: { performTime: 'asc' },
      }),
      this.prisma.show.count({ where }),
    ]);
    const formattedShows = shows.map((show) => {
      const properties = (show.properties as Record<string, unknown> | null) || null;
      const thumbnailUrl =
        (typeof properties?.thumbnailUrl === 'string' && properties.thumbnailUrl) ||
        (typeof properties?.bannerUrl === 'string' && properties.bannerUrl) ||
        null;
      return {
        id: show.id,
        title: show.title,
        slug: show.slug,
        thumbnailUrl,
        description: show.description,
        performTime: show.performTime,
        checkInTime: show.checkInTime,
        status: show.status,
        seatSelectionEnabled: (show as any).seatSelectionEnabled ?? true,
        stage: {
          id: show.stage.id,
          name: show.stage.name,
          location: show.stage.location,
        },
        branch: show.branch
          ? {
              id: show.branch.id,
              name: show.branch.name,
            }
          : null,
        artists: show.artists.map((sa) => ({
          id: sa.artist.id,
          name: sa.artist.name,
          isHeadline: sa.isHeadline,
        })),
        ticketClasses: show.ticketClasses,
        availableTickets: show._count.tickets,
        minPrice: show.ticketClasses.length
          ? Math.min(...show.ticketClasses.map((tc) => Number(tc.price)))
          : null,
        linkedTours:
          show.linkedTours?.map((t) => ({
            departureLoc: t.departureLoc
              ? { name: t.departureLoc.name, slug: t.departureLoc.slug }
              : null,
            destinationLoc: t.destinationLoc
              ? { name: t.destinationLoc.name, slug: t.destinationLoc.slug }
              : null,
          })) || [],
      };
    });
    const result = paginate(formattedShows, total, filterDto.page || 1, filterDto.limit || 10);
    await this.cache.set(cacheKey, result, CACHE_TTL.SHORT);
    return result;
  }
  async findBySlug(slug: string) {
    const cacheKey = CacheKeys.showBySlug(slug);
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    const show = await this.prisma.show.findFirst({
      where: {
        slug,
        deletedAt: null,
      },
      include: {
        stage: {
          include: {
            location: true,
          },
        },
        branch: true,
        artists: {
          include: {
            artist: true,
          },
        },
        ticketClasses: {
          where: { deletedAt: null },
          include: {
            _count: {
              select: {
                tickets: {
                  where: { status: 'AVAILABLE' },
                },
              },
            },
          },
        },
        linkedTours: {
          include: {
            departureLoc: true,
            destinationLoc: true,
          },
        },
      },
    });
    if (!show) {
      throw new NotFoundException({
        code: ERROR_CODES.SHOW_001,
        message: getErrorMessage(ERROR_CODES.SHOW_001),
      });
    }
    const properties = (show.properties as Record<string, unknown> | null) || null;
    const thumbnailUrl =
      (typeof properties?.thumbnailUrl === 'string' && properties.thumbnailUrl) ||
      (typeof properties?.bannerUrl === 'string' && properties.bannerUrl) ||
      null;
    const result = {
      id: show.id,
      title: show.title,
      slug: show.slug,
      thumbnailUrl,
      description: show.description,
      performTime: show.performTime,
      checkInTime: show.checkInTime,
      status: show.status,
      seatSelectionEnabled: (show as any).seatSelectionEnabled ?? true,
      properties: show.properties,
      metaTitle: show.metaTitle,
      metaDescription: show.metaDescription,
      stage: {
        id: show.stage.id,
        name: show.stage.name,
        address: show.stage.address,
        mapLink: show.stage.mapLink,
        location: show.stage.location,
      },
      branch: show.branch
        ? {
            id: show.branch.id,
            name: show.branch.name,
          }
        : null,
      artists: show.artists.map((sa) => ({
        id: sa.artist.id,
        name: sa.artist.name,
        bio: sa.artist.bio,
        socialLinks: sa.artist.socialLinks,
        isHeadline: sa.isHeadline,
      })),
      ticketClasses: show.ticketClasses.map((tc) => ({
        id: tc.id,
        name: tc.name,
        price: tc.price,
        colorCode: tc.colorCode,
        availableCount: tc._count.tickets,
      })),
      linkedTours:
        show.linkedTours?.map((t) => ({
          departureLoc: t.departureLoc
            ? { name: t.departureLoc.name, slug: t.departureLoc.slug }
            : null,
          destinationLoc: t.destinationLoc
            ? { name: t.destinationLoc.name, slug: t.destinationLoc.slug }
            : null,
        })) || [],
    };
    await this.cache.set(cacheKey, result, CACHE_TTL.MEDIUM);
    return result;
  }
  async findById(id: number) {
    const show = await this.prisma.show.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
    if (!show) {
      throw new NotFoundException({
        code: ERROR_CODES.SHOW_001,
        message: getErrorMessage(ERROR_CODES.SHOW_001),
      });
    }
    return show;
  }
  async getSeatMap(showId: number) {
    const cacheKey = CacheKeys.showSeatMap(showId);
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    await this.findById(showId);
    const tickets = await this.prisma.ticket.findMany({
      where: { showId },
      include: {
        physicalSeat: true,
        ticketClass: {
          select: {
            id: true,
            name: true,
            colorCode: true,
            price: true,
          },
        },
      },
    });
    const ticketsList = tickets.map((ticket) => ({
      id: ticket.id,
      status: ticket.status,
      ticketClass: ticket.ticketClass,
      seat: ticket.physicalSeat
        ? {
            id: ticket.physicalSeat.id,
            zone: ticket.physicalSeat.zoneName,
            row: ticket.physicalSeat.rowName,
            number: ticket.physicalSeat.seatNumber,
            type: ticket.physicalSeat.type,
            x: ticket.physicalSeat.xPosition,
            y: ticket.physicalSeat.yPosition,
          }
        : null,
    }));
    const result = { tickets: ticketsList };
    await this.cache.set(cacheKey, result, CACHE_TTL.VERY_SHORT);
    return result;
  }
  async getTicketClasses(showId: number) {
    const cacheKey = CacheKeys.showTicketClasses(showId);
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    await this.findById(showId);
    const ticketClasses = await this.prisma.ticketClass.findMany({
      where: {
        showId,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            tickets: {
              where: { status: 'AVAILABLE' },
            },
          },
        },
      },
    });
    const result = ticketClasses.map((tc) => ({
      id: tc.id,
      name: tc.name,
      price: tc.price,
      colorCode: tc.colorCode,
      totalQuantity: tc.totalQuantity,
      availableCount: tc._count.tickets,
    }));
    await this.cache.set(cacheKey, result, CACHE_TTL.SHORT);
    return result;
  }
  async create(createShowDto: CreateShowDto) {
    const slug = this.generateSlug(createShowDto.title);
    const stage = await this.prisma.stage.findUnique({
      where: { id: createShowDto.stageId },
    });
    if (!stage) {
      throw new NotFoundException({
        code: ERROR_CODES.STAGE_001,
        message: 'Sân khấu không tồn tại.',
      });
    }
    if (createShowDto.branchId) {
      const branch = await this.prisma.branch.findUnique({
        where: { id: createShowDto.branchId },
      });
      if (!branch) {
        throw new NotFoundException({
          code: 'BRANCH_001',
          message: 'Chi nhánh không tồn tại.',
        });
      }
    }
    const show = await this.prisma.show.create({
      data: {
        title: createShowDto.title,
        slug,
        description: createShowDto.description,
        stageId: createShowDto.stageId,
        branchId: createShowDto.branchId,
        performTime: new Date(createShowDto.performTime),
        checkInTime: createShowDto.checkInTime ? new Date(createShowDto.checkInTime) : null,
        status: ShowStatus.UPCOMING,
        properties: createShowDto.properties as object | undefined,
        metaTitle: createShowDto.metaTitle,
        metaDescription: createShowDto.metaDescription,
      },
    });
    await this.cache.delPattern(CachePatterns.showLists());
    return show;
  }
  async update(id: number, updateShowDto: UpdateShowDto, updatedBy: number) {
    const existingShow = await this.findById(id);
    if (existingShow.status === ShowStatus.ENDED || existingShow.status === ShowStatus.CANCELLED) {
      throw new BadRequestException({
        code: ERROR_CODES.SHOW_002,
        message: getErrorMessage(ERROR_CODES.SHOW_002),
      });
    }
    const updateData: Record<string, unknown> = {
      updatedBy,
    };
    if (updateShowDto.title !== undefined) {
      updateData.title = updateShowDto.title;
      updateData.slug = this.generateSlug(updateShowDto.title);
    }
    if (updateShowDto.description !== undefined) {
      updateData.description = updateShowDto.description;
    }
    if (updateShowDto.stageId !== undefined) {
      updateData.stageId = updateShowDto.stageId;
    }
    if (updateShowDto.branchId !== undefined) {
      updateData.branchId = updateShowDto.branchId;
    }
    if (updateShowDto.performTime !== undefined) {
      updateData.performTime = new Date(updateShowDto.performTime);
    }
    if (updateShowDto.checkInTime !== undefined) {
      updateData.checkInTime = new Date(updateShowDto.checkInTime);
    }
    if (updateShowDto.status !== undefined) {
      updateData.status = updateShowDto.status;
    }
    if (updateShowDto.properties !== undefined) {
      updateData.properties = updateShowDto.properties;
    }
    if (updateShowDto.metaTitle !== undefined) {
      updateData.metaTitle = updateShowDto.metaTitle;
    }
    if (updateShowDto.metaDescription !== undefined) {
      updateData.metaDescription = updateShowDto.metaDescription;
    }
    if (updateShowDto.metaKeywords !== undefined) {
      updateData.metaKeywords = updateShowDto.metaKeywords;
    }
    if (updateShowDto.branchId) {
      const branch = await this.prisma.branch.findUnique({
        where: { id: updateShowDto.branchId },
      });
      if (!branch) {
        throw new NotFoundException({
          code: 'BRANCH_001',
          message: 'Chi nhánh không tồn tại.',
        });
      }
    }
    const updatedShow = await this.prisma.show.update({
      where: { id },
      data: updateData,
      include: {
        stage: {
          include: {
            location: true,
          },
        },
        branch: true,
      },
    });
    await this.invalidateShowCache(id, existingShow.slug || undefined);
    return updatedShow;
  }
  async softDelete(id: number, deletedBy: number) {
    const existingShow = await this.findById(id);
    const soldTicketsCount = await this.prisma.ticket.count({
      where: {
        showId: id,
        status: 'SOLD',
      },
    });
    if (soldTicketsCount > 0) {
      throw new BadRequestException({
        code: ERROR_CODES.SHOW_002,
        message: 'Không thể xóa show đã có vé bán. Vui lòng hủy show thay vì xóa.',
      });
    }
    await this.prisma.show.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: deletedBy,
      },
    });
    await this.invalidateShowCache(id, existingShow.slug || undefined);
    return { message: 'Đã xóa sự kiện thành công.' };
  }
  async invalidateShowCache(showId: number, slug?: string) {
    const keysToDelete = [
      CacheKeys.show(showId),
      CacheKeys.showSeatMap(showId),
      CacheKeys.showTicketClasses(showId),
    ];
    if (slug) {
      keysToDelete.push(CacheKeys.showBySlug(slug));
    }
    await this.cache.delMany(keysToDelete);
    await this.cache.delPattern(CachePatterns.showLists());
  }
  async getRelated(id: number) {
    const show = await this.prisma.show.findUnique({
      where: { id },
      include: {
        stage: {
          include: {
            location: true,
          },
        },
      },
    });
    if (!show) return [];
    const relatedShows = await this.prisma.show.findMany({
      where: {
        id: { not: id },
        status: ShowStatus.UPCOMING,
        deletedAt: null,
      },
      include: {
        stage: {
          include: {
            location: true,
          },
        },
        ticketClasses: {
          where: { deletedAt: null },
        },
      },
      take: 8,
      orderBy: [
        {
          stage: {
            locationId: show.stage.locationId ? 'asc' : 'desc',
          },
        },
        { performTime: 'asc' },
      ],
    });
    const sorted = [...relatedShows]
      .sort((a, b) => {
        if (
          a.stage.locationId === show.stage.locationId &&
          b.stage.locationId !== show.stage.locationId
        )
          return -1;
        if (
          a.stage.locationId !== show.stage.locationId &&
          b.stage.locationId === show.stage.locationId
        )
          return 1;
        return 0;
      })
      .slice(0, 4);
    return sorted.map((s) => {
      const properties = (s.properties as Record<string, unknown> | null) || null;
      const thumbnailUrl =
        (typeof properties?.thumbnailUrl === 'string' && properties.thumbnailUrl) ||
        (typeof properties?.bannerUrl === 'string' && properties.bannerUrl) ||
        null;
      return {
        id: s.id,
        title: s.title,
        slug: s.slug,
        thumbnailUrl,
        performTime: s.performTime,
        status: s.status,
        stage: {
          name: s.stage.name,
          location: s.stage.location,
        },
        minPrice: s.ticketClasses.length
          ? Math.min(...s.ticketClasses.map((tc) => Number(tc.price)))
          : null,
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
