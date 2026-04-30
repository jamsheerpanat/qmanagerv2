import { Module } from '@nestjs/common';
import {
  ServiceTypesService,
  CategoriesService,
  ProductsService,
  ServiceItemsService,
} from './catalog.services';
import {
  ServiceTypesController,
  CategoriesController,
  ProductsController,
  ServiceItemsController,
} from './catalog.controllers';

@Module({
  controllers: [
    ServiceTypesController,
    CategoriesController,
    ProductsController,
    ServiceItemsController,
  ],
  providers: [
    ServiceTypesService,
    CategoriesService,
    ProductsService,
    ServiceItemsService,
  ],
})
export class CatalogModule {}
