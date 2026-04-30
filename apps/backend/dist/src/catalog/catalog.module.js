"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogModule = void 0;
const common_1 = require("@nestjs/common");
const catalog_services_1 = require("./catalog.services");
const catalog_controllers_1 = require("./catalog.controllers");
let CatalogModule = class CatalogModule {
};
exports.CatalogModule = CatalogModule;
exports.CatalogModule = CatalogModule = __decorate([
    (0, common_1.Module)({
        controllers: [
            catalog_controllers_1.ServiceTypesController,
            catalog_controllers_1.CategoriesController,
            catalog_controllers_1.ProductsController,
            catalog_controllers_1.ServiceItemsController,
        ],
        providers: [
            catalog_services_1.ServiceTypesService,
            catalog_services_1.CategoriesService,
            catalog_services_1.ProductsService,
            catalog_services_1.ServiceItemsService,
        ],
    })
], CatalogModule);
//# sourceMappingURL=catalog.module.js.map