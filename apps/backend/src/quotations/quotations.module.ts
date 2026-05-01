import { Module } from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { QuotationsController } from './quotations.controller';
import { QuotationsInternalController } from './quotations-internal.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PdfModule } from '../pdf/pdf.module';

@Module({
  imports: [
    PrismaModule,
    PdfModule,
  ],
  controllers: [QuotationsController, QuotationsInternalController],
  providers: [QuotationsService],
})
export class QuotationsModule {}
