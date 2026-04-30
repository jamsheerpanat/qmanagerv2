import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
export declare class PdfController {
    private pdfQueue;
    private prisma;
    constructor(pdfQueue: Queue, prisma: PrismaService);
    generateSample(body: any, req: any): Promise<{
        success: boolean;
        documentId: string;
        message: string;
    }>;
}
