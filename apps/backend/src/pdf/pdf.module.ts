import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PdfController } from './pdf.controller';
import { PdfProcessor } from './pdf.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'pdf-generation',
    }),
  ],
  controllers: [PdfController],
  providers: [PdfProcessor],
})
export class PdfModule {}
