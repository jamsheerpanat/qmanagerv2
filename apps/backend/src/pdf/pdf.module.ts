import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { BullModule } from '@nestjs/bullmq';
import { PdfService } from './pdf.service';
import { PdfController } from './pdf.controller';
import { PdfProcessor } from './pdf.processor';
import { InternalRenderGuard } from '../common/guards/internal-render.guard';

/**
 * The asynchronous document pipeline (BullMQ queue -> Playwright worker ->
 * MinIO upload -> Document/DocumentVerification rows) is opt-in.
 *
 * It was previously written but never registered in any module, so
 * `POST /pdf/sample-quotation` and the whole QR-verification chain simply did
 * not exist at runtime. Registering it unconditionally would make the entire
 * API depend on a reachable Redis at boot, which the synchronous download path
 * does not need — so it is gated behind ENABLE_PDF_QUEUE=1.
 */
const pdfQueueEnabled = process.env.ENABLE_PDF_QUEUE === '1';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-key',
    }),
    ...(pdfQueueEnabled
      ? [BullModule.registerQueue({ name: 'pdf-generation' })]
      : []),
  ],
  controllers: pdfQueueEnabled ? [PdfController] : [],
  providers: [
    PdfService,
    InternalRenderGuard,
    ...(pdfQueueEnabled ? [PdfProcessor] : []),
  ],
  exports: [PdfService, InternalRenderGuard],
})
export class PdfModule {}
