import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@UseGuards(JwtAuthGuard)
@Controller('pdf')
export class PdfController {
  constructor(
    @InjectQueue('pdf-generation') private pdfQueue: Queue,
    private prisma: PrismaService,
  ) {}

  @Post('sample-quotation')
  async generateSample(@Body() body: any, @Req() req: any) {
    const { templateId, customerName, totalAmount } = body;

    // Create a DRAFT document record immediately
    const document = await this.prisma.document.create({
      data: {
        type: 'QUOTATION',
        referenceId: `SAMPLE-${templateId}-${Date.now()}`,
        status: 'PROCESSING',
      },
    });

    // Add job to BullMQ
    await this.pdfQueue.add('generate-pdf', {
      documentId: document.id,
      templateId,
      userId: req.user.id,
      customerName: customerName || 'Sample Customer LLC',
      totalAmount: totalAmount || 25000,
    });

    return {
      success: true,
      documentId: document.id,
      message: 'PDF generation queued',
    };
  }
}
