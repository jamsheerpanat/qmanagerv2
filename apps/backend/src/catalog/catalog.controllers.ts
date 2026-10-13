import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ServiceTypesService,
  CategoriesService,
  ProductsService,
  ServiceItemsService,
} from './catalog.services';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('catalog/service-types')
export class ServiceTypesController {
  constructor(private readonly service: ServiceTypesService) {}

  @RequirePermissions('products.view')
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @RequirePermissions('products.view')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('products.create')
  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @RequirePermissions('products.update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }
}

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('catalog/categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @RequirePermissions('products.view')
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @RequirePermissions('products.create')
  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @RequirePermissions('products.update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }
}

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('catalog/products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @RequirePermissions('products.view')
  @Get()
  findAll() {
    return this.service.findAll();
  }

  // Declared before ':id', which would otherwise capture "export".
  @RequirePermissions('products.view')
  @Get('export')
  async export(@Res() res: Response) {
    const file = await this.service.exportToExcel();
    const date = new Date().toISOString().split('T')[0];
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="products-${date}.xlsx"`,
    });
    res.send(file);
  }

  @RequirePermissions('products.view')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('products.create')
  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @RequirePermissions('products.update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @RequirePermissions('products.update')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('catalog/service-items')
export class ServiceItemsController {
  constructor(private readonly service: ServiceItemsService) {}

  @RequirePermissions('products.view')
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @RequirePermissions('products.create')
  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @RequirePermissions('products.update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }
}
