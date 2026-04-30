import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
import type { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller()
export class DocumentsController {
  constructor(
    private prisma: PrismaService,
    private minio: MinioService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('documents/:id')
  async getDocument(@Param('id') id: string) {
    const document = await this.prisma.document.findUnique({ where: { id } });
    if (!document) throw new NotFoundException();
    return document;
  }

  @UseGuards(JwtAuthGuard)
  @Get('documents/:id/download')
  async downloadDocument(@Param('id') id: string, @Res() res: Response) {
    const document = await this.prisma.document.findUnique({ where: { id } });
    if (!document || !document.pdfUrl) throw new NotFoundException();

    try {
      const stream = await this.minio.getFileStream(document.pdfUrl);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${document.referenceId}.pdf"`,
      );
      stream.pipe(res);
    } catch (error) {
      throw new NotFoundException('File not found in storage');
    }
  }

  // Public endpoint
  @Get('verify/:token')
  async verifyDocument(@Param('token') token: string) {
    const verification = await this.prisma.documentVerification.findUnique({
      where: { token },
      include: { document: true },
    });

    if (!verification) {
      throw new NotFoundException('Invalid verification token');
    }

    const metadata: any = verification.document.metadata || {};

    return {
      documentId: verification.document.id,
      referenceId: verification.document.referenceId,
      status: verification.document.status,
      type: verification.document.type,
      createdAt: verification.document.createdAt,
      verifiedAt: new Date(),
      customerName: metadata.customerName || 'N/A',
      totalAmount: metadata.totalAmount || 0,
      hash: metadata.hash || 'N/A',
      revision: metadata.revision || 1,
    };
  }
}
