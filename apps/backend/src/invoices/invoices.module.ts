import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { InvoicesInternalController } from './invoices-internal.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PdfModule } from '../pdf/pdf.module';

@Module({
  imports: [PrismaModule, PdfModule],
  controllers: [InvoicesController, InvoicesInternalController],
  providers: [InvoicesService],
})
export class InvoicesModule {}
