import { Controller, Get, Patch, Param, Req, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.notificationsService.findAll(req.user.companyId, req.user.id);
  }

  @Get('unread-count')
  getUnreadCount(@Req() req: any) {
    return this.notificationsService.getUnreadCount(
      req.user.companyId,
      req.user.id,
    );
  }

  @Patch('read-all')
  markAllAsRead(@Req() req: any) {
    return this.notificationsService.markAllAsRead(
      req.user.companyId,
      req.user.id,
    );
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @Req() req: any) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }
}
