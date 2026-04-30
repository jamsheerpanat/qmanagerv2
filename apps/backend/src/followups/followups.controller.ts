import {
  Controller,
  Post,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FollowUpsService } from './followups.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('leads/:leadId/followups')
export class FollowUpsController {
  constructor(private readonly followUpsService: FollowUpsService) {}

  @RequirePermissions('leads.update')
  @Post()
  create(@Param('leadId') leadId: string, @Body() body: any, @Req() req: any) {
    return this.followUpsService.create(leadId, body, req.user.id);
  }

  @RequirePermissions('leads.update')
  @Patch(':id/complete')
  complete(@Param('id') id: string, @Req() req: any) {
    return this.followUpsService.complete(id, req.user.id);
  }
}
