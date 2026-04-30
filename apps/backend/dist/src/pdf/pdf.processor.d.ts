import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
export declare class PdfProcessor extends WorkerHost {
    private prisma;
    private minio;
    constructor(prisma: PrismaService, minio: MinioService);
    process(job: Job<any, any, string>): Promise<any>;
}
