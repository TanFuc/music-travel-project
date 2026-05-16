import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { $Enums } from '@prisma/client';
import { CacheService } from '@/cache/cache.service';
import { CacheKeys } from '@/cache/cache-keys.constant';
import { R2StorageService } from '@/modules/media/r2/r2-storage.service';
@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly r2StorageService: R2StorageService,
  ) {}
  async getDashboardStats() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [
      totalUsers,
      newUsersThisMonth,
      totalShows,
      upcomingShows,
      totalTours,
      activeTourSchedules,
      totalBookings,
      pendingBookings,
      totalRevenue,
      revenueThisMonth,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({
        where: { deletedAt: null, createdAt: { gte: firstDayOfMonth } },
      }),
      this.prisma.show.count({ where: { deletedAt: null } }),
      this.prisma.show.count({
        where: { status: 'UPCOMING', performTime: { gte: now }, deletedAt: null },
      }),
      this.prisma.tour.count({ where: { deletedAt: null } }),
      this.prisma.tourSchedule.count({
        where: { status: 'OPEN', startDate: { gte: now }, deletedAt: null },
      }),
      this.prisma.booking.count(),
      this.prisma.booking.count({ where: { status: 'PENDING' } }),
      this.prisma.transaction.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { status: 'SUCCESS', createdAt: { gte: firstDayOfMonth } },
        _sum: { amount: true },
      }),
    ]);
    return {
      users: {
        total: totalUsers,
        newThisMonth: newUsersThisMonth,
      },
      shows: {
        total: totalShows,
        upcoming: upcomingShows,
      },
      tours: {
        total: totalTours,
        activeSchedules: activeTourSchedules,
      },
      bookings: {
        total: totalBookings,
        pendingCount: pendingBookings,
        totalRevenue: Number(totalRevenue._sum.amount || 0),
        revenueThisMonth: Number(revenueThisMonth._sum.amount || 0),
      },
    };
  }
  async getRevenueStats() {
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const [thisMonthRevenue, lastMonthRevenue, dailyRevenue] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { status: 'SUCCESS', createdAt: { gte: thisMonth } },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { status: 'SUCCESS', createdAt: { gte: lastMonth, lt: thisMonth } },
        _sum: { amount: true },
      }),
      this.prisma.transaction.groupBy({
        by: ['createdAt'],
        where: {
          status: 'SUCCESS',
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        _sum: { amount: true },
      }),
    ]);
    return {
      thisMonth: thisMonthRevenue._sum.amount || 0,
      lastMonth: lastMonthRevenue._sum.amount || 0,
      dailyRevenue,
    };
  }
  async getRecentBookings() {
    const bookings = await this.prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, fullName: true, phoneNumber: true } },
        items: {
          include: {
            ticket: { include: { show: true } },
            tourSchedule: { include: { tour: true } },
          },
        },
      },
    });
    return { items: bookings };
  }
  async getUpcomingShows() {
    return this.prisma.show.findMany({
      where: { status: 'UPCOMING', performTime: { gte: new Date() }, deletedAt: null },
      take: 10,
      orderBy: { performTime: 'asc' },
      include: {
        stage: { include: { location: true } },
        _count: { select: { tickets: { where: { status: 'AVAILABLE' } } } },
      },
    });
  }
  async getUsers(page: number = 1, limit: number = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          deletedAt: null,
          OR: [
            { fullName: { contains: search, mode: 'insensitive' as const } },
            { phoneNumber: { contains: search } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : { deletedAt: null };
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          phoneNumber: true,
          fullName: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        phoneNumber: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            bookings: true,
            notifications: true,
          },
        },
      },
    });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
  async createUser(data: {
    phoneNumber: string;
    fullName: string;
    email?: string;
    password: string;
    role: 'USER' | 'STAFF' | 'ADMIN' | 'PARTNER';
  }) {
    const existingUser = await this.prisma.user.findUnique({
      where: { phoneNumber: data.phoneNumber },
    });
    if (existingUser) {
      throw new Error('Phone number already exists');
    }
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        phoneNumber: data.phoneNumber,
        fullName: data.fullName,
        email: data.email,
        passwordHash,
        role: data.role,
        isActive: true,
      },
      select: {
        id: true,
        phoneNumber: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }
  async updateUser(
    id: number,
    data: {
      fullName?: string;
      email?: string;
      role?: 'USER' | 'STAFF' | 'ADMIN' | 'PARTNER';
      isActive?: boolean;
    },
  ) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        phoneNumber: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }
  async deleteUser(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
  async toggleUserStatus(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }
    return this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        isActive: true,
      },
    });
  }
  async getShows(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.show.findMany({
        where: { deletedAt: null },
        skip,
        take: limit,
        orderBy: { performTime: 'desc' },
        include: {
          stage: { include: { location: true } },
          artists: { include: { artist: true } },
          ticketClasses: true,
          _count: { select: { tickets: true } },
        },
      }),
      this.prisma.show.count({ where: { deletedAt: null } }),
    ]);
    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async getShowById(id: number) {
    const show = await this.prisma.show.findUnique({
      where: { id },
      include: {
        stage: { include: { location: true } },
        artists: { include: { artist: true } },
        ticketClasses: true,
        _count: { select: { tickets: true } },
      },
    });
    if (!show) throw new Error('Show not found');
    return show;
  }
  async createShow(data: {
    title: string;
    description?: string;
    stageId: number;
    performTime: Date;
    status: 'UPCOMING' | 'ONGOING' | 'ENDED' | 'CANCELLED';
  }) {
    return this.prisma.show.create({
      data,
      include: {
        stage: { include: { location: true } },
      },
    });
  }
  async updateShow(
    id: number,
    data: Partial<{
      title: string;
      description: string;
      stageId: number;
      branchId: number | null;
      performTime: Date;
      checkInTime: Date | null;
      status: 'UPCOMING' | 'ONGOING' | 'ENDED' | 'CANCELLED';
      seatSelectionEnabled: boolean;
      properties: any;
      metaTitle: string;
      metaDescription: string;
      metaKeywords: string;
    }>,
  ) {
    const show = await this.prisma.show.findUnique({ where: { id } });
    if (!show) throw new Error('Show not found');
    return this.prisma.show.update({
      where: { id },
      data,
      include: {
        stage: { include: { location: true } },
      },
    });
  }
  async deleteShow(id: number) {
    const show = await this.prisma.show.findUnique({ where: { id } });
    if (!show) throw new Error('Show not found');
    return this.prisma.show.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
  async updateShowStatus(id: number, status: 'UPCOMING' | 'ONGOING' | 'ENDED' | 'CANCELLED') {
    const show = await this.prisma.show.findUnique({ where: { id } });
    if (!show) throw new Error('Show not found');
    return this.prisma.show.update({
      where: { id },
      data: { status },
    });
  }
  async createShowFull(
    data: {
      title: string;
      description?: string;
      stageId: number;
      performTime: string;
      checkInTime?: string;
      seatSelectionEnabled?: boolean;
      artists?: Array<{
        artistId?: number;
        name?: string;
        bio?: string;
        isHeadline: boolean;
      }>;
      ticketClasses: Array<{
        name: string;
        price: number;
        colorCode?: string;
        quantity: number;
        sortOrder?: number;
      }>;
      properties?: Record<string, unknown>;
      metaTitle?: string;
      metaDescription?: string;
      metaKeywords?: string;
    },
    createdBy: number,
  ) {
    const stage = await this.prisma.stage.findUnique({
      where: { id: data.stageId },
      include: { physicalSeats: true },
    });
    if (!stage) throw new Error('Stage not found');
    return this.prisma.$transaction(async (tx) => {
      const slug = this.generateSlug(data.title);
      const show = await tx.show.create({
        data: {
          title: data.title,
          slug,
          description: data.description,
          stageId: data.stageId,
          performTime: new Date(data.performTime),
          checkInTime: data.checkInTime ? new Date(data.checkInTime) : null,
          seatSelectionEnabled: data.seatSelectionEnabled ?? true,
          status: 'UPCOMING',
          properties: data.properties as any,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          metaKeywords: data.metaKeywords,
          createdBy,
        },
      });
      if (data.artists && data.artists.length > 0) {
        for (const artistData of data.artists) {
          let artistId = artistData.artistId;
          if (!artistId && artistData.name) {
            const newArtist = await tx.artist.create({
              data: {
                name: artistData.name,
                bio: artistData.bio,
                createdBy,
              },
            });
            artistId = newArtist.id;
          }
          if (artistId) {
            await tx.showArtist.create({
              data: {
                showId: show.id,
                artistId,
                isHeadline: artistData.isHeadline,
              },
            });
          }
        }
      }
      for (let i = 0; i < data.ticketClasses.length; i++) {
        const tcData = data.ticketClasses[i];
        const ticketClass = await tx.ticketClass.create({
          data: {
            showId: show.id,
            name: tcData.name,
            price: tcData.price,
            colorCode: tcData.colorCode,
            totalQuantity: tcData.quantity,
          },
        });
        const ticketsToCreate = Array.from({ length: tcData.quantity }, (_, idx) => ({
          showId: show.id,
          ticketClassId: ticketClass.id,
          ticketCode: `${show.id}-${ticketClass.id}-${String(idx + 1).padStart(4, '0')}`,
          status: 'AVAILABLE' as const,
          physicalSeatId: null,
        }));
        await tx.ticket.createMany({ data: ticketsToCreate });
      }
      return tx.show.findUnique({
        where: { id: show.id },
        include: {
          stage: { include: { location: true } },
          artists: { include: { artist: true } },
          ticketClasses: true,
          _count: { select: { tickets: true } },
        },
      });
    });
  }
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .concat('-', Date.now().toString(36));
  }
  async getArtists(page: number = 1, limit: number = 50, search?: string) {
    const skip = (page - 1) * limit;
    const where = {
      deletedAt: null,
      ...(search && {
        name: { contains: search, mode: 'insensitive' as const },
      }),
    };
    const [items, total] = await Promise.all([
      this.prisma.artist.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          bio: true,
          socialLinks: true,
          createdAt: true,
          _count: { select: { shows: true } },
        },
      }),
      this.prisma.artist.count({ where }),
    ]);
    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async getArtistById(id: number) {
    const artist = await this.prisma.artist.findUnique({
      where: { id },
      include: {
        shows: {
          include: {
            show: { select: { id: true, title: true, performTime: true, status: true } },
          },
        },
      },
    });
    if (!artist) throw new Error('Artist not found');
    return artist;
  }
  async createArtist(
    data: {
      name: string;
      bio?: string;
      socialLinks?: Record<string, string>;
    },
    createdBy: number,
  ) {
    return this.prisma.artist.create({
      data: {
        name: data.name,
        bio: data.bio,
        socialLinks: data.socialLinks,
        createdBy,
      },
      select: {
        id: true,
        name: true,
        bio: true,
        socialLinks: true,
        createdAt: true,
      },
    });
  }
  async updateArtist(
    id: number,
    data: {
      name?: string;
      bio?: string;
      socialLinks?: Record<string, string>;
    },
    updatedBy: number,
  ) {
    const artist = await this.prisma.artist.findUnique({ where: { id } });
    if (!artist) throw new Error('Artist not found');
    return this.prisma.artist.update({
      where: { id },
      data: {
        ...data,
        updatedBy,
      },
    });
  }
  async deleteArtist(id: number) {
    const artist = await this.prisma.artist.findUnique({
      where: { id },
      include: { _count: { select: { shows: true } } },
    });
    if (!artist) throw new Error('Artist not found');
    if (artist._count.shows > 0) {
      throw new Error('Cannot delete artist with existing shows');
    }
    return this.prisma.artist.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
  async getTours(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.tour.findMany({
        where: { deletedAt: null },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          departureLoc: true,
          destinationLoc: true,
          _count: { select: { schedules: true } },
        },
      }),
      this.prisma.tour.count({ where: { deletedAt: null } }),
    ]);
    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async getTourById(id: number) {
    const tour = await this.prisma.tour.findUnique({
      where: { id },
      include: {
        departureLoc: true,
        destinationLoc: true,
        schedules: true,
      },
    });
    if (!tour) throw new Error('Tour not found');
    return tour;
  }
  async createTour(data: {
    title: string;
    description?: string;
    duration: string;
    departureLocId?: number;
    destinationLocId?: number;
  }) {
    return this.prisma.tour.create({
      data,
      include: {
        departureLoc: true,
        destinationLoc: true,
      },
    });
  }
  async updateTour(
    id: number,
    data: Partial<{
      title: string;
      description: string;
      duration: string;
      departureLocId: number;
      destinationLocId: number;
    }>,
  ) {
    const tour = await this.prisma.tour.findUnique({ where: { id } });
    if (!tour) throw new Error('Tour not found');
    return this.prisma.tour.update({
      where: { id },
      data,
    });
  }
  async deleteTour(id: number) {
    const tour = await this.prisma.tour.findUnique({ where: { id } });
    if (!tour) throw new Error('Tour not found');
    return this.prisma.tour.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
  async getTicketById(id: number) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        show: true,
        ticketClass: true,
        ticketTier: true,
        physicalSeat: true,
        booking: { include: { user: true } },
      },
    });
    if (!ticket) throw new Error('Ticket not found');
    return ticket;
  }
  async getTicketByCode(code: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { ticketCode: code },
      include: {
        show: true,
        ticketClass: true,
        ticketTier: true,
        physicalSeat: { include: { stage: { include: { location: true } } } },
        booking: { include: { user: true } },
        redeemedShow: true,
      },
    });
    if (!ticket) throw new Error('Không tìm thấy vé');
    return ticket;
  }
  async updateTicketStatus(
    id: number,
    status: 'AVAILABLE' | 'LOCKED' | 'SOLD' | 'USED' | 'CANCELLED',
  ) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new Error('Ticket not found');
    const updateData: any = { status };
    if (status === 'USED') {
      updateData.isCheckedIn = true;
      updateData.checkedInAt = new Date();
    }
    return this.prisma.ticket.update({
      where: { id },
      data: updateData,
    });
  }
  async checkInTicket(code: string, showId: number) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { ticketCode: code },
    });
    if (!ticket) throw new Error('Không tìm thấy vé');
    if (ticket.status === $Enums.TicketStatus.USED) throw new Error('Vé đã được sử dụng');
    if (ticket.status === $Enums.TicketStatus.CANCELLED) throw new Error('Vé đã bị hủy');
    return this.prisma.ticket.update({
      where: { ticketCode: code },
      data: {
        status: $Enums.TicketStatus.USED,
        isCheckedIn: true,
        checkedInAt: new Date(),
        redeemedShowId: showId,
      },
    });
  }
  async getPaymentById(id: number) {
    const payment = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            user: true,
            items: true,
          },
        },
      },
    });
    if (!payment) throw new Error('Payment not found');
    return payment;
  }
  async updatePaymentStatus(id: number, status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED') {
    const payment = await this.prisma.transaction.findUnique({ where: { id } });
    if (!payment) throw new Error('Payment not found');
    return this.prisma.transaction.update({
      where: { id },
      data: { status },
    });
  }
  async getMediaById(id: number) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) throw new Error('Media not found');
    return media;
  }
  async createMedia(data: {
    url: string;
    type: 'IMAGE' | 'VIDEO';
    targetType: 'SHOW' | 'TOUR' | 'STAGE' | 'ARTIST';
    targetId: number;
    isFeatured?: boolean;
  }) {
    return this.prisma.media.create({
      data: {
        ...data,
        isFeatured: data.isFeatured ?? false,
      },
    });
  }
  async updateMedia(
    id: number,
    data: Partial<{
      url: string;
      isFeatured: boolean;
    }>,
  ) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) throw new Error('Media not found');
    const updatedMedia = await this.prisma.media.update({
      where: { id },
      data,
    });
    if (data.url && data.url !== media.url) {
      await this.deleteR2FileByUrl(media.url, `update media ${id}`);
    }
    return updatedMedia;
  }
  async deleteMedia(id: number) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) throw new Error('Media not found');
    const deletedMedia = await this.prisma.media.delete({ where: { id } });
    await this.deleteR2FileByUrl(media.url, `delete media ${id}`);
    return deletedMedia;
  }
  private async deleteR2FileByUrl(url?: string, reason?: string): Promise<void> {
    if (!url) {
      return;
    }
    const key = this.r2StorageService.getKeyFromUrl(url);
    if (!key) {
      return;
    }
    try {
      await this.r2StorageService.deleteObject(key);
    } catch (error) {
      this.logger.warn(`Failed to remove old R2 object (${reason || 'unknown reason'}): ${key}`);
    }
  }
  async getBookings(
    page: number = 1,
    limit: number = 20,
    filters?: {
      status?: string;
      paymentStatus?: string;
      search?: string;
      fromDate?: string;
      toDate?: string;
    },
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (filters?.status) {
      if (filters.status === 'PROCESSED') {
        where.status = { in: ['CONFIRMED', 'COMPLETED'] };
      } else if (filters.status === 'PENDING') {
        where.status = { in: ['PENDING', 'MANUAL_REVIEW'] };
      } else {
        where.status = filters.status;
      }
    }
    if (filters?.paymentStatus) {
      where.paymentStatus = filters.paymentStatus;
    }
    if (filters?.search) {
      where.OR = [
        { bookingCode: { contains: filters.search, mode: 'insensitive' } },
        { user: { fullName: { contains: filters.search, mode: 'insensitive' } } },
        { user: { phoneNumber: { contains: filters.search } } },
      ];
    }
    if (filters?.fromDate || filters?.toDate) {
      where.createdAt = {};
      if (filters.fromDate) {
        where.createdAt.gte = new Date(filters.fromDate);
      }
      if (filters.toDate) {
        const endDate = new Date(filters.toDate);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }
    const [items, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, phoneNumber: true, email: true } },
          items: {
            include: {
              ticket: {
                include: {
                  show: {
                    select: {
                      id: true,
                      title: true,
                      performTime: true,
                      stage: { select: { name: true, address: true } },
                    },
                  },
                  ticketClass: { select: { name: true, colorCode: true } },
                },
              },
              tourSchedule: {
                include: {
                  tour: { select: { id: true, title: true } },
                },
              },
              ticketTier: { select: { name: true, colorCode: true } },
              singerPackage: { select: { name: true, colorCode: true } },
            },
          },
          transactions: {
            where: { status: 'SUCCESS' },
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { paymentMethod: true, payTime: true },
          },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);
    const transformedItems = items.map((booking) => {
      const paidTransaction = booking.transactions[0];
      return {
        id: booking.id,
        bookingCode: booking.bookingCode,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        paymentMethod: paidTransaction?.paymentMethod || null,
        totalAmount: Number(booking.totalAmount),
        discountAmount: Number(booking.discountAmount),
        finalAmount: Number(booking.finalAmount),
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        paidAt: paidTransaction?.payTime || null,
        user: booking.user,
        itemCount: booking.items.length,
        items: booking.items.map((item) => ({
          id: item.id,
          itemType: item.itemType,
          quantity: item.quantity,
          unitPrice: Number(item.originalPrice),
          subtotal: Number(item.originalPrice) * item.quantity,
          productName:
            item.ticket?.show?.title ||
            item.tourSchedule?.tour?.title ||
            item.singerPackage?.name ||
            'N/A',
          ticketClass: item.ticket?.ticketClass || null,
          ticketTier: item.ticketTier || null,
          singerPackage: item.singerPackage || null,
          show: item.ticket?.show || null,
          tour: item.tourSchedule?.tour || null,
        })),
      };
    });
    return {
      items: transformedItems,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async getTickets(
    page: number = 1,
    limit: number = 20,
    filters?: {
      showId?: number;
      ticketClassId?: number;
      ticketTierId?: number;
      status?: string;
      checkedIn?: boolean;
      search?: string;
      zoneName?: string;
      fromDate?: string;
      toDate?: string;
    },
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (filters?.showId) {
      where.showId = filters.showId;
    }
    if (filters?.ticketClassId) {
      where.ticketClassId = filters.ticketClassId;
    }
    if (filters?.ticketTierId) {
      where.ticketTierId = filters.ticketTierId;
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    if (typeof filters?.checkedIn === 'boolean') {
      where.isCheckedIn = filters.checkedIn;
    }
    if (filters?.zoneName) {
      where.physicalSeat = {
        zoneName: { contains: filters.zoneName, mode: 'insensitive' },
      };
    }
    if (filters?.search) {
      where.OR = [
        { ticketCode: { contains: filters.search, mode: 'insensitive' } },
        { booking: { bookingCode: { contains: filters.search, mode: 'insensitive' } } },
        { booking: { user: { fullName: { contains: filters.search, mode: 'insensitive' } } } },
        { booking: { user: { phoneNumber: { contains: filters.search } } } },
        { show: { title: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }
    if (filters?.fromDate || filters?.toDate) {
      where.createdAt = {};
      if (filters.fromDate) {
        where.createdAt.gte = new Date(filters.fromDate);
      }
      if (filters.toDate) {
        const endDate = new Date(filters.toDate);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }
    const [items, total, statusCounts, checkedInCount, zoneRows] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          show: {
            select: {
              id: true,
              title: true,
              performTime: true,
              status: true,
              stage: { select: { id: true, name: true } },
            },
          },
          ticketClass: true,
          ticketTier: true,
          physicalSeat: true,
          booking: {
            select: {
              id: true,
              bookingCode: true,
              status: true,
              paymentStatus: true,
              user: { select: { id: true, fullName: true, phoneNumber: true, email: true } },
            },
          },
          redeemedShow: { select: { id: true, title: true } },
        },
      }),
      this.prisma.ticket.count({ where }),
      this.prisma.ticket.groupBy({
        by: ['status'],
        where,
        _count: { _all: true },
      }),
      this.prisma.ticket.count({ where: { ...where, isCheckedIn: true } }),
      this.prisma.ticket.findMany({
        where: {
          ...where,
          physicalSeat: { zoneName: { not: null } },
        },
        distinct: ['physicalSeatId'],
        select: {
          physicalSeat: { select: { zoneName: true } },
        },
      }),
    ]);
    const summaryByStatus = statusCounts.reduce(
      (acc, item) => ({
        ...acc,
        [item.status]: item._count._all,
      }),
      {} as Record<string, number>,
    );
    const zones = Array.from(
      new Set(
        zoneRows
          .map((row) => row.physicalSeat?.zoneName)
          .filter((zoneName): zoneName is string => Boolean(zoneName)),
      ),
    ).sort((a, b) => a.localeCompare(b, 'vi'));
    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        summary: {
          total,
          checkedIn: checkedInCount,
          notCheckedIn: total - checkedInCount,
          byStatus: summaryByStatus,
          zones,
        },
      },
    };
  }
  async getPayments(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.transaction.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          booking: {
            include: {
              user: { select: { id: true, fullName: true, phoneNumber: true } },
            },
          },
        },
      }),
      this.prisma.transaction.count(),
    ]);
    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async getVouchers(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.voucher.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: { select: { id: true, fullName: true, referralCode: true, phoneNumber: true } },
        },
      }),
      this.prisma.voucher.count(),
    ]);
    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async getMedia(
    page: number = 1,
    limit: number = 20,
    targetType?: 'SHOW' | 'TOUR' | 'STAGE' | 'ARTIST',
  ) {
    const skip = (page - 1) * limit;
    const where = targetType ? { targetType } : {};
    const [items, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.media.count({ where }),
    ]);
    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async getNotifications(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, phoneNumber: true } },
        },
      }),
      this.prisma.notification.count(),
    ]);
    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async getVoucherById(id: number) {
    const voucher = await this.prisma.voucher.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, fullName: true, phoneNumber: true, referralCode: true } },
      },
    });
    if (!voucher) throw new Error('Voucher not found');
    return voucher;
  }
  async createVoucher(data: {
    code: string;
    discountType: 'PERCENT' | 'FIXED_AMOUNT';
    discountValue: number;
    minOrderValue?: number;
    usageLimit?: number;
    startDate?: Date;
    endDate?: Date;
    isActive?: boolean;
  }) {
    const existing = await this.prisma.voucher.findUnique({ where: { code: data.code } });
    if (existing) throw new Error('Voucher code already exists');
    return this.prisma.voucher.create({
      data: {
        ...data,
        usedCount: 0,
        isActive: data.isActive ?? true,
      },
    });
  }
  async updateVoucher(
    id: number,
    data: Partial<{
      discountValue: number;
      minOrderValue: number;
      usageLimit: number;
      startDate: Date;
      endDate: Date;
      isActive: boolean;
    }>,
  ) {
    const voucher = await this.prisma.voucher.findUnique({ where: { id } });
    if (!voucher) throw new Error('Voucher not found');
    return this.prisma.voucher.update({ where: { id }, data });
  }
  async deleteVoucher(id: number) {
    const voucher = await this.prisma.voucher.findUnique({ where: { id } });
    if (!voucher) throw new Error('Voucher not found');
    return this.prisma.voucher.delete({ where: { id } });
  }
  async getBookingById(id: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            email: true,
          },
        },
        items: {
          include: {
            ticket: {
              include: {
                show: {
                  select: {
                    id: true,
                    title: true,
                    performTime: true,
                    description: true,
                    stage: { select: { name: true, address: true } },
                  },
                },
                ticketClass: { select: { name: true, price: true, colorCode: true } },
              },
            },
            tourSchedule: {
              include: {
                tour: { select: { id: true, title: true, description: true, duration: true } },
              },
            },
            ticketTier: {
              select: {
                name: true,
                price: true,
                description: true,
                benefits: true,
                colorCode: true,
              },
            },
            singerPackage: {
              select: {
                name: true,
                price: true,
                description: true,
                benefits: true,
                colorCode: true,
              },
            },
          },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            paymentMethod: true,
            amount: true,
            status: true,
            payTime: true,
            createdAt: true,
          },
        },
        voucher: {
          include: {
            owner: { select: { id: true, fullName: true, referralCode: true, phoneNumber: true } },
          },
        },
      },
    });
    if (!booking) throw new Error('Booking not found');
    const getItemTypeLabel = (itemType: string) => {
      switch (itemType) {
        case 'SHOW_TICKET':
          return 'Vé xem show';
        case 'TOUR':
          return 'Tour du lịch';
        case 'SINGER_PACKAGE':
          return 'Gói ca sĩ';
        default:
          return itemType;
      }
    };
    const paidTransaction = booking.transactions.find((t) => t.status === 'SUCCESS');
    return {
      id: booking.id,
      bookingCode: booking.bookingCode,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      paymentMethod: paidTransaction?.paymentMethod || null,
      totalAmount: Number(booking.totalAmount),
      discountAmount: Number(booking.discountAmount),
      finalAmount: Number(booking.finalAmount),
      note: booking.note,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      paidAt: paidTransaction?.payTime || null,
      user: booking.user,
      items: booking.items.map((item) => ({
        id: item.id,
        itemType: item.itemType,
        itemTypeLabel: getItemTypeLabel(item.itemType),
        quantity: item.quantity,
        unitPrice: Number(item.originalPrice),
        subtotal: Number(item.originalPrice) * item.quantity,
        productName:
          item.ticket?.show?.title ||
          item.tourSchedule?.tour?.title ||
          item.singerPackage?.name ||
          'N/A',
        show: item.ticket?.show
          ? {
              ...item.ticket.show,
              startDate: item.ticket.show.performTime,
            }
          : null,
        tour: item.tourSchedule
          ? {
              ...item.tourSchedule.tour,
              departureDate: item.tourSchedule.startDate,
            }
          : null,
        ticketClass: item.ticket?.ticketClass
          ? {
              name: item.ticket.ticketClass.name,
              price: Number(item.ticket.ticketClass.price),
              colorCode: item.ticket.ticketClass.colorCode,
            }
          : null,
        ticketTier: item.ticketTier
          ? {
              name: item.ticketTier.name,
              price: Number(item.ticketTier.price),
              description: item.ticketTier.description,
              benefits: item.ticketTier.benefits,
              colorCode: item.ticketTier.colorCode,
            }
          : null,
        singerPackage: item.singerPackage
          ? {
              name: item.singerPackage.name,
              price: Number(item.singerPackage.price),
              description: item.singerPackage.description,
              benefits: item.singerPackage.benefits,
              colorCode: item.singerPackage.colorCode,
            }
          : null,
      })),
      transactions: booking.transactions.map((t) => ({
        id: t.id,
        paymentMethod: t.paymentMethod,
        amount: Number(t.amount),
        status: t.status,
        payTime: t.payTime,
        createdAt: t.createdAt,
      })),
    };
  }
  async updateBookingStatus(
    id: number,
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED',
  ) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new Error('Booking not found');
    const updated = await this.prisma.booking.update({
      where: { id },
      data: { status },
    });
    await this.invalidateUserBookingCache(booking.userId, booking.bookingCode);
    return updated;
  }
  async cancelBooking(id: number, reason?: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!booking) throw new Error('Booking not found');
    if (booking.items.length > 0) {
      const ticketIds = booking.items.filter((item) => item.ticketId).map((item) => item.ticketId!);
      if (ticketIds.length > 0) {
        await this.prisma.ticket.updateMany({
          where: { id: { in: ticketIds } },
          data: { status: 'AVAILABLE' },
        });
      }
    }
    const updated = await this.prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        note: reason,
      },
    });
    await this.invalidateUserBookingCache(booking.userId, booking.bookingCode);
    return updated;
  }
  private async invalidateUserBookingCache(userId: number, bookingCode: string) {
    await this.cache.delMany([
      CacheKeys.bookingByCode(bookingCode),
      CacheKeys.userBookings(userId),
      `${CacheKeys.userBookings(userId)}:shows`,
      `${CacheKeys.userBookings(userId)}:singer`,
    ]);
  }
  async createNotification(data: {
    userId: number;
    title: string;
    message: string;
    type: 'ORDER' | 'PROMOTION' | 'SYSTEM';
  }) {
    return this.prisma.notification.create({
      data: {
        ...data,
        isRead: false,
      },
    });
  }
  async markNotificationAsRead(id: number) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }
  async deleteNotification(id: number) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new Error('Notification not found');
    return this.prisma.notification.delete({ where: { id } });
  }
  async broadcastNotification(data: {
    title: string;
    message: string;
    type: 'ORDER' | 'PROMOTION' | 'SYSTEM';
    userIds?: number[];
  }) {
    let targetUserIds = data.userIds;
    if (!targetUserIds || targetUserIds.length === 0) {
      const users = await this.prisma.user.findMany({
        where: { isActive: true, deletedAt: null },
        select: { id: true },
      });
      targetUserIds = users.map((u) => u.id);
    }
    const notifications = targetUserIds.map((userId) => ({
      userId,
      title: data.title,
      message: data.message,
      type: data.type,
      isRead: false,
    }));
    return this.prisma.notification.createMany({
      data: notifications,
    });
  }
  async getStages(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.stage.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          location: true,
          _count: { select: { shows: true } },
        },
      }),
      this.prisma.stage.count(),
    ]);
    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async getStageById(id: number) {
    const stage = await this.prisma.stage.findUnique({
      where: { id },
      include: {
        location: true,
        physicalSeats: true,
        _count: { select: { shows: true } },
      },
    });
    if (!stage) throw new Error('Stage not found');
    return stage;
  }
}
