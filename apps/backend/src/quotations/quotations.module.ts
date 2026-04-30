import { Module } from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { QuotationsController } from './quotations.controller';
import { QuotationsInternalController } from './quotations-internal.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'pdf-generation',
    }),
  ],
  controllers: [QuotationsController, QuotationsInternalController],
  providers: [QuotationsService],
})
export class QuotationsModule {}
