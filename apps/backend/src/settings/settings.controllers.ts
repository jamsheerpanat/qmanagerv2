import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  CompanySettingsService,
  BankAccountsService,
  QuotationTemplatesService,
} from './settings.services';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly service: CompanySettingsService) {}

  @RequirePermissions('settings.manage')
  @Get('company')
  getCompany(@Req() req: any) {
    return this.service.getCompany(req.user.companyId);
  }

  @RequirePermissions('settings.manage')
  @Patch('company')
  updateCompany(@Req() req: any, @Body() body: any) {
    return this.service.updateCompany(req.user.companyId, body);
  }
}

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('settings/banks')
export class BanksController {
  constructor(private readonly service: BankAccountsService) {}

  @RequirePermissions('settings.manage')
  @Post()
  create(@Req() req: any, @Body() body: any) {
    return this.service.create(req.user.companyId, body);
  }

  @RequirePermissions('settings.manage')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @RequirePermissions('settings.manage')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('settings/templates')
export class TemplatesController {
  constructor(private readonly service: QuotationTemplatesService) {}

  @RequirePermissions('settings.manage')
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @RequirePermissions('settings.manage')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('settings.manage')
  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @RequirePermissions('settings.manage')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }
}
