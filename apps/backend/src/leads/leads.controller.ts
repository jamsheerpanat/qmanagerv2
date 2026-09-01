import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { parseLimit } from '../common/parse-limit';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @RequirePermissions('leads.view')
  @Get()
  findAll(@Req() req: any, @Query('limit') limit?: string) {
    return this.leadsService.findAll(req.user.companyId, parseLimit(limit));
  }

  @RequirePermissions('leads.view')
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.leadsService.findOne(id, req.user.companyId);
  }

  @RequirePermissions('leads.create')
  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.leadsService.create(body, req.user.id, req.user.companyId);
  }

  @RequirePermissions('leads.update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.leadsService.update(id, body, req.user.id);
  }
}
