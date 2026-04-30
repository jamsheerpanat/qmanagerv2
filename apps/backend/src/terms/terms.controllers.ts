import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  TermsCategoriesService,
  TermsTemplatesService,
} from './terms.services';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('terms/categories')
export class TermsCategoriesController {
  constructor(private readonly service: TermsCategoriesService) {}

  @RequirePermissions('terms.view')
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @RequirePermissions('terms.create')
  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @RequirePermissions('terms.update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }
}

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('terms/templates')
export class TermsTemplatesController {
  constructor(private readonly service: TermsTemplatesService) {}

  @RequirePermissions('terms.view')
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @RequirePermissions('terms.create')
  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @RequirePermissions('terms.update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @RequirePermissions('terms.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
