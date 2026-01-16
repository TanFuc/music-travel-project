import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) { }

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
      // Users
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({
        where: { deletedAt: null, createdAt: { gte: firstDayOfMonth } },
      }),
      // Shows
      this.prisma.show.count({ where: { deletedAt: null } }),
      this.prisma.show.count({
        where: { status: 'UPCOMING', performTime: { gte: now }, deletedAt: null },
      }),
      // Tours
      this.prisma.tour.count({ where: { deletedAt: null } }),
      this.prisma.tourSchedule.count({
        where: { status: 'OPEN', startDate: { gte: now }, deletedAt: null },
      }),
      // Bookings
      this.prisma.booking.count(),
      this.prisma.booking.count({ where: { status: 'PENDING' } }),
      // Revenue
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

  // ============================================================================
  // USERS MANAGEMENT
  // ============================================================================
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
    // Check if phone number already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { phoneNumber: data.phoneNumber },
    });

    if (existingUser) {
      throw new Error('Phone number already exists');
    }

    // Hash password
    const bcrypt = require('bcrypt');
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

    // Soft delete
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

  // ============================================================================
  // SHOWS MANAGEMENT
  // ============================================================================
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
        tickets: { include: { ticketClass: true } },
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
      performTime: Date;
      status: 'UPCOMING' | 'ONGOING' | 'ENDED' | 'CANCELLED';
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

    // Soft delete
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

  // ============================================================================
  // TOURS MANAGEMENT
  // ============================================================================
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

  async updateTour(id: number, data: Partial<{
    title: string;
    description: string;
    duration: string;
    departureLocId: number;
    destinationLocId: number;
  }>) {
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

  // ============================================================================
  // TICKETS CRUD
  // ============================================================================
  async getTicketById(id: number) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        show: true,
        ticketClass: true,
        physicalSeat: true,
      },
    });
    if (!ticket) throw new Error('Ticket not found');
    return ticket;
  }

  async updateTicketStatus(id: number, status: 'AVAILABLE' | 'LOCKED' | 'SOLD') {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new Error('Ticket not found');

    return this.prisma.ticket.update({
      where: { id },
      data: { status },
    });
  }

  // ============================================================================
  // PAYMENTS CRUD
  // ============================================================================
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

  // ============================================================================
  // MEDIA CRUD
  // ============================================================================
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

  async updateMedia(id: number, data: Partial<{
    url: string;
    isFeatured: boolean;
  }>) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) throw new Error('Media not found');

    return this.prisma.media.update({
      where: { id },
      data,
    });
  }

  async deleteMedia(id: number) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) throw new Error('Media not found');

    return this.prisma.media.delete({ where: { id } });
  }

  // ============================================================================
  // BOOKINGS MANAGEMENT
  // ============================================================================
  async getBookings(page: number = 1, limit: number = 20, status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED') {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [items, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
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
      }),
      this.prisma.booking.count({ where }),
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

  // ============================================================================
  // TICKETS MANAGEMENT
  // ============================================================================
  async getTickets(page: number = 1, limit: number = 20, showId?: number) {
    const skip = (page - 1) * limit;
    const where = showId ? { showId } : {};

    const [items, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          show: { select: { id: true, title: true } },
          ticketClass: true,
          physicalSeat: true,
        },
      }),
      this.prisma.ticket.count({ where }),
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

  // ============================================================================
  // PAYMENTS MANAGEMENT
  // ============================================================================
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

  // ============================================================================
  // VOUCHERS MANAGEMENT
  // ============================================================================
  async getVouchers(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.voucher.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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

  // ============================================================================
  // MEDIA MANAGEMENT
  // ============================================================================
  async getMedia(page: number = 1, limit: number = 20, targetType?: 'SHOW' | 'TOUR' | 'STAGE' | 'ARTIST') {
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

  // ============================================================================
  // NOTIFICATIONS MANAGEMENT
  // ============================================================================
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

  // ============================================================================
  // VOUCHERS CRUD
  // ============================================================================
  async getVoucherById(id: number) {
    const voucher = await this.prisma.voucher.findUnique({ where: { id } });
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

  async updateVoucher(id: number, data: Partial<{
    discountValue: number;
    minOrderValue: number;
    usageLimit: number;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
  }>) {
    const voucher = await this.prisma.voucher.findUnique({ where: { id } });
    if (!voucher) throw new Error('Voucher not found');

    return this.prisma.voucher.update({ where: { id }, data });
  }

  async deleteVoucher(id: number) {
    const voucher = await this.prisma.voucher.findUnique({ where: { id } });
    if (!voucher) throw new Error('Voucher not found');

    return this.prisma.voucher.delete({ where: { id } });
  }

  // ============================================================================
  // BOOKINGS CRUD
  // ============================================================================
  async getBookingById(id: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        user: true,
        items: {
          include: {
            ticket: { include: { show: true } },
            tourSchedule: { include: { tour: true } },
          },
        },
        transactions: true,
      },
    });
    if (!booking) throw new Error('Booking not found');
    return booking;
  }

  async updateBookingStatus(id: number, status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED') {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new Error('Booking not found');

    return this.prisma.booking.update({
      where: { id },
      data: { status },
    });
  }

  async cancelBooking(id: number, reason?: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!booking) throw new Error('Booking not found');

    // Release tickets back to available
    if (booking.items.length > 0) {
      const ticketIds = booking.items
        .filter(item => item.ticketId)
        .map(item => item.ticketId!);

      if (ticketIds.length > 0) {
        await this.prisma.ticket.updateMany({
          where: { id: { in: ticketIds } },
          data: { status: 'AVAILABLE' },
        });
      }
    }

    return this.prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        note: reason,
      },
    });
  }

  // ============================================================================
  // NOTIFICATIONS CRUD
  // ============================================================================
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

    // If no specific users, send to all active users
    if (!targetUserIds || targetUserIds.length === 0) {
      const users = await this.prisma.user.findMany({
        where: { isActive: true, deletedAt: null },
        select: { id: true },
      });
      targetUserIds = users.map(u => u.id);
    }

    const notifications = targetUserIds.map(userId => ({
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

  // ============================================================================
  // STAGES MANAGEMENT
  // ============================================================================
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
