import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    createNotification(data: {
        companyId: string;
        userId?: string;
        title: string;
        message: string;
        type: NotificationType;
        referenceId?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        companyId: string;
        userId: string | null;
        title: string;
        type: import("@prisma/client").$Enums.NotificationType;
        referenceId: string | null;
        message: string;
        isRead: boolean;
    }>;
    findAll(companyId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        companyId: string;
        userId: string | null;
        title: string;
        type: import("@prisma/client").$Enums.NotificationType;
        referenceId: string | null;
        message: string;
        isRead: boolean;
    }[]>;
    getUnreadCount(companyId: string, userId: string): Promise<number>;
    markAsRead(id: string, userId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    markAllAsRead(companyId: string, userId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
