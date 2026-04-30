import { PrismaService } from '../prisma/prisma.service';
export declare class TimelineService {
    private prisma;
    constructor(prisma: PrismaService);
    logEvent(data: {
        customerId: string;
        title: string;
        description?: string;
        action: string;
        entityType?: string;
        entityId?: string;
        userId?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        action: string;
        description: string | null;
        userId: string | null;
        customerId: string;
        title: string;
        entityType: string | null;
        entityId: string | null;
    }>;
    getTimeline(customerId: string): Promise<({
        user: {
            id: string;
            name: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        action: string;
        description: string | null;
        userId: string | null;
        customerId: string;
        title: string;
        entityType: string | null;
        entityId: string | null;
    })[]>;
}
