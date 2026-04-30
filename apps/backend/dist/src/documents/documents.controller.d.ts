import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
import type { Response } from 'express';
export declare class DocumentsController {
    private prisma;
    private minio;
    constructor(prisma: PrismaService, minio: MinioService);
    getDocument(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        type: string;
        referenceId: string;
        pdfUrl: string | null;
        fileHash: string | null;
        fileSizeBytes: number | null;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        generatedById: string | null;
    }>;
    downloadDocument(id: string, res: Response): Promise<void>;
    verifyDocument(token: string): Promise<{
        documentId: string;
        referenceId: string;
        status: string;
        type: string;
        createdAt: Date;
        verifiedAt: Date;
        customerName: any;
        totalAmount: any;
        hash: any;
        revision: any;
    }>;
}
