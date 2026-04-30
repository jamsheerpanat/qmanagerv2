import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(req: any): Promise<{
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
    getUnreadCount(req: any): Promise<number>;
    markAllAsRead(req: any): Promise<import("@prisma/client").Prisma.BatchPayload>;
    markAsRead(id: string, req: any): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
