import { TimelineService } from './timeline.service';
export declare class TimelineController {
    private readonly timelineService;
    constructor(timelineService: TimelineService);
    getTimeline(id: string): Promise<({
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
