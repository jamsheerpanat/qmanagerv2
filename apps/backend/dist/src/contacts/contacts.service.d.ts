import { PrismaService } from '../prisma/prisma.service';
import { TimelineService } from '../timeline/timeline.service';
export declare class ContactsService {
    private prisma;
    private timeline;
    constructor(prisma: PrismaService, timeline: TimelineService);
    create(customerId: string, data: any, actorId: string): Promise<{
        id: string;
        name: string;
        phone: string | null;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        whatsapp: string | null;
        notes: string | null;
        customerId: string;
        isPrimary: boolean;
        designation: string | null;
        department: string | null;
    }>;
    update(id: string, data: any): Promise<{
        id: string;
        name: string;
        phone: string | null;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        whatsapp: string | null;
        notes: string | null;
        customerId: string;
        isPrimary: boolean;
        designation: string | null;
        department: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        phone: string | null;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        whatsapp: string | null;
        notes: string | null;
        customerId: string;
        isPrimary: boolean;
        designation: string | null;
        department: string | null;
    }>;
}
