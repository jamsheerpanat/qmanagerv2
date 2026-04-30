import { PrismaService } from '../prisma/prisma.service';
import { TimelineService } from '../timeline/timeline.service';
export declare class FollowUpsService {
    private prisma;
    private timeline;
    constructor(prisma: PrismaService, timeline: TimelineService);
    create(leadId: string, data: any, actorId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        followUpDate: Date;
        followUpType: import("@prisma/client").$Enums.FollowUpType;
        nextAction: string | null;
        nextFollowUpDate: Date | null;
        completedAt: Date | null;
        reminderStatus: string;
        leadId: string;
        completedByUserId: string | null;
    }>;
    complete(id: string, actorId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        followUpDate: Date;
        followUpType: import("@prisma/client").$Enums.FollowUpType;
        nextAction: string | null;
        nextFollowUpDate: Date | null;
        completedAt: Date | null;
        reminderStatus: string;
        leadId: string;
        completedByUserId: string | null;
    }>;
}
