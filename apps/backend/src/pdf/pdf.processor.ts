import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { chromium } from 'playwright';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
import * as crypto from 'crypto';

@Processor('pdf-generation')
export class PdfProcessor extends WorkerHost {
  constructor(
    private prisma: PrismaService,
    private minio: MinioService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const {
      documentId,
      templateId,
      userId,
      customerName,
      totalAmount,
      quotationId,
    } = job.data;

    // Build render URL — service-specific templates use dedicated routes,
    // all others fall through to the generic [templateId] route.
    const SERVICE_TEMPLATE_ROUTES: Record<string, string> = {
      'home-automation': 'home-automation',
      'smart-home': 'home-automation',
      'smart-home-automation': 'home-automation',
      'building-automation': 'building-automation',
      bms: 'building-automation',
      'software-development': 'software-development',
      software: 'software-development',
      'web-development': 'software-development',
      'it-infrastructure': 'it-infrastructure',
      'it-infra': 'it-infrastructure',
      network: 'it-infrastructure',
    };
    const routeSegment = SERVICE_TEMPLATE_ROUTES[templateId] || templateId;
    const qParam = quotationId ? `&quotationId=${quotationId}` : '';
    const renderUrl = `http://localhost:3000/render-pdf/${routeSegment}?docId=${documentId}${qParam}`;

    try {
      const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });
      const page = await browser.newPage();

      await page.goto(renderUrl, { waitUntil: 'networkidle' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
      });

      await browser.close();

      const hash = crypto.createHash('sha256').update(pdfBuffer).digest('hex');
      const fileName = `document-${documentId}-${Date.now()}.pdf`;

      await this.minio.uploadFile(
        fileName,
        Buffer.from(pdfBuffer),
        'application/pdf',
      );

      const token = crypto.randomBytes(16).toString('hex');

      await this.prisma.$transaction(async (tx) => {
        await tx.document.update({
          where: { id: documentId },
          data: {
            status: 'PUBLISHED',
            pdfUrl: fileName,
            metadata: {
              hash,
              customerName,
              totalAmount,
            },
          },
        });

        await tx.documentVerification.create({
          data: {
            documentId: documentId,
            token,
          },
        });
      });

      return { success: true, fileName, hash, token };
    } catch (error) {
      console.error(`Error processing PDF job ${job.id}:`, error);
      await this.prisma.document.update({
        where: { id: documentId },
        data: { status: 'FAILED' },
      });
      throw error;
    }
  }
}
