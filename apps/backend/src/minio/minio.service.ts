import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private minioClient: Minio.Client;
  private readonly logger = new Logger(MinioService.name);
  private readonly bucketName =
    process.env.MINIO_BUCKET || 'qmanager-documents';

  constructor() {
    // Previously endpoint and credentials were hardcoded to the local docker
    // mapping, so a deployed instance silently pointed at a MinIO that was not
    // there and every upload failed.
    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9002', 10),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    });
  }

  async onModuleInit() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');

        // Set bucket policy to allow public reads for the demo if desired,
        // but typically documents should be private and accessed via signed URLs or backend streams.
        // For simplicity, we'll keep it private and generate presigned URLs.
        this.logger.log(`Created MinIO bucket: ${this.bucketName}`);
      }
    } catch (error) {
      this.logger.error('Error initializing MinIO bucket', error);
    }
  }

  async uploadFile(
    fileName: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<string> {
    await this.minioClient.putObject(
      this.bucketName,
      fileName,
      buffer,
      buffer.length,
      {
        'Content-Type': mimeType,
      },
    );
    return fileName;
  }

  async getPresignedUrl(
    fileName: string,
    expiry: number = 3600,
  ): Promise<string> {
    return this.minioClient.presignedGetObject(
      this.bucketName,
      fileName,
      expiry,
    );
  }

  async getFileStream(fileName: string) {
    return this.minioClient.getObject(this.bucketName, fileName);
  }
}
