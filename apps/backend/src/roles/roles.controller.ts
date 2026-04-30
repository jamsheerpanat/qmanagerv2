import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @RequirePermissions('settings.manage')
  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @RequirePermissions('settings.manage')
  @Post()
  createRole(@Body() body: any, @Req() req: any) {
    return this.rolesService.createRole(body, req.user.id);
  }

  @RequirePermissions('settings.manage')
  @Patch(':id')
  updateRole(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.rolesService.updateRole(id, body, req.user.id);
  }
}

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly rolesService: RolesService) {}

  @RequirePermissions('settings.manage')
  @Get()
  findAll() {
    return this.rolesService.findAllPermissions();
  }
}
