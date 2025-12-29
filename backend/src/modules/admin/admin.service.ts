import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const [totalUsers, totalBookings, totalShows, totalTours, pendingBookings, recentTransactions] =
      await Promise.all([
        this.prisma.user.count({ where: { deletedAt: null } }),
        this.prisma.booking.count(),
        this.prisma.show.count({ where: { deletedAt: null } }),
        this.prisma.tour.count({ where: { deletedAt: null } }),
        this.prisma.booking.count({ where: { status: 'PENDING' } }),
        this.prisma.transaction.aggregate({
          where: { status: 'SUCCESS' },
          _sum: { amount: true },
        }),
      ]);

    return {
      totalUsers,
      totalBookings,
      totalShows,
      totalTours,
      pendingBookings,
      totalRevenue: recentTransactions._sum.amount || 0,
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
        where: { status: 'SUCCESS', createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
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
    return this.prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, fullName: true, phoneNumber: true } },
        items: { include: { ticket: { include: { show: true } }, tourSchedule: { include: { tour: true } } } },
      },
    });
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
}
