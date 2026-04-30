import { OnModuleInit } from '@nestjs/common';
export declare class MinioService implements OnModuleInit {
    private minioClient;
    private readonly logger;
    private readonly bucketName;
    constructor();
    onModuleInit(): Promise<void>;
    uploadFile(fileName: string, buffer: Buffer, mimeType: string): Promise<string>;
    getPresignedUrl(fileName: string, expiry?: number): Promise<string>;
    getFileStream(fileName: string): Promise<import("stream").Readable>;
}
