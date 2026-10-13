import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { TimelineService } from './timeline.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('customers/:id/timeline')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @RequirePermissions('customers.view')
  @Get()
  getTimeline(@Param('id') id: string) {
    return this.timelineService.getTimeline(id);
  }
}
