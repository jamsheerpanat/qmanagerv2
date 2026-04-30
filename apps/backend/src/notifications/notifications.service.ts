import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async createNotification(data: {
    companyId: string;
    userId?: string;
    title: string;
    message: string;
    type: NotificationType;
    referenceId?: string;
  }) {
    return this.prisma.notification.create({
      data,
    });
  }

  async findAll(companyId: string, userId: string) {
    // Only return notifications meant for the user, or company-wide notifications if userId is null
    return this.prisma.notification.findMany({
      where: {
        companyId,
        OR: [
          { userId },
          { userId: null } // Optional: broadcast to all admins in the company
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getUnreadCount(companyId: string, userId: string) {
    return this.prisma.notification.count({
      where: {
        companyId,
        isRead: false,
        OR: [{ userId }, { userId: null }]
      }
    });
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, OR: [{ userId }, { userId: null }] },
      data: { isRead: true },
    });
  }

  async markAllAsRead(companyId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { companyId, isRead: false, OR: [{ userId }, { userId: null }] },
      data: { isRead: true },
    });
  }
}
