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
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @RequirePermissions('customers.view')
  @Get()
  findAll() {
    return this.customersService.findAll();
  }

  @RequirePermissions('customers.view')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @RequirePermissions('customers.create')
  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.customersService.create(body, req.user.id, req.user.companyId);
  }

  @RequirePermissions('customers.update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.customersService.update(id, body, req.user.id);
  }
}
