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
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @RequirePermissions('users.manage')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @RequirePermissions('users.manage')
  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.usersService.create(body, req.user.id);
  }

  @RequirePermissions('users.manage')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.usersService.update(id, body, req.user.id);
  }
}
