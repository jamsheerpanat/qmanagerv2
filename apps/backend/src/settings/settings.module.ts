import { Module } from '@nestjs/common';
import {
  CompanySettingsService,
  BankAccountsService,
  QuotationTemplatesService,
} from './settings.services';
import {
  SettingsController,
  BanksController,
  TemplatesController,
} from './settings.controllers';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SettingsController, BanksController, TemplatesController],
  providers: [
    CompanySettingsService,
    BankAccountsService,
    QuotationTemplatesService,
  ],
})
export class SettingsModule {}
