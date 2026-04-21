import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { NotificationType } from '@prisma/client';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { getPaginationParams, paginate } from '@/common/utils/pagination.util';
@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}
  async findByUserId(userId: number, pagination: PaginationDto) {
    const { skip, take } = getPaginationParams(pagination);
    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);
    return paginate(notifications, total, pagination.page || 1, pagination.limit || 10);
  }
  async getUnreadCount(userId: number) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { unreadCount: count };
  }
  async markAsRead(userId: number, notificationId: bigint) {
    await this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
    return { message: 'Đã đánh dấu đã đọc.' };
  }
  async markAllAsRead(userId: number) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { markedCount: result.count, message: 'Đã đánh dấu tất cả đã đọc.' };
  }
  async create(
    userId: number,
    title: string,
    message: string,
    type: NotificationType,
    referenceId?: number,
  ) {
    return this.prisma.notification.create({
      data: { userId, title, message, type, referenceId },
    });
  }
}
