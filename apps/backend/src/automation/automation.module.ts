import { Module } from '@nestjs/common';
import { AutomationService } from './automation.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  providers: [AutomationService],
})
export class AutomationModule {}
