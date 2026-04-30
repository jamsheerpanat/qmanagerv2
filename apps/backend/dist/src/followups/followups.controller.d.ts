import { FollowUpsService } from './followups.service';
export declare class FollowUpsController {
    private readonly followUpsService;
    constructor(followUpsService: FollowUpsService);
    create(leadId: string, body: any, req: any): Promise<{
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
    complete(id: string, req: any): Promise<{
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
