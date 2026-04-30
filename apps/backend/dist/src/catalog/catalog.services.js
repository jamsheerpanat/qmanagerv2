"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceItemsService = exports.ProductsService = exports.CategoriesService = exports.ServiceTypesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ServiceTypesService = class ServiceTypesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.serviceType.findMany({
            orderBy: { createdAt: 'asc' },
        });
    }
    async findOne(id) {
        const serviceType = await this.prisma.serviceType.findUnique({
            where: { id },
            include: {
                categories: true,
                products: true,
                serviceItems: true,
                termsTemplates: true,
            },
        });
        if (!serviceType)
            throw new common_1.NotFoundException();
        return serviceType;
    }
    async create(data) {
        return this.prisma.serviceType.create({ data });
    }
    async update(id, data) {
        return this.prisma.serviceType.update({ where: { id }, data });
    }
};
exports.ServiceTypesService = ServiceTypesService;
exports.ServiceTypesService = ServiceTypesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ServiceTypesService);
let CategoriesService = class CategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.productCategory.findMany({
            include: { serviceType: true, parent: true },
            orderBy: { createdAt: 'asc' },
        });
    }
    async create(data) {
        return this.prisma.productCategory.create({ data });
    }
    async update(id, data) {
        return this.prisma.productCategory.update({ where: { id }, data });
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
let ProductsService = class ProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.product.findMany({
            include: { category: true, serviceType: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: { category: true, serviceType: true },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return product;
    }
    async create(data) {
        if (data.sellingPrice < data.minimumSellingPrice) {
            throw new common_1.BadRequestException('Selling price cannot be less than minimum selling price');
        }
        return this.prisma.product.create({ data });
    }
    async update(id, data) {
        if (data.sellingPrice &&
            data.minimumSellingPrice &&
            data.sellingPrice < data.minimumSellingPrice) {
            throw new common_1.BadRequestException('Selling price cannot be less than minimum selling price');
        }
        return this.prisma.product.update({ where: { id }, data });
    }
    async remove(id) {
        return this.prisma.product.delete({ where: { id } });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
let ServiceItemsService = class ServiceItemsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.serviceItem.findMany({
            include: { serviceType: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(data) {
        if (data.defaultPrice < data.minimumPrice) {
            throw new common_1.BadRequestException('Default price cannot be less than minimum price');
        }
        return this.prisma.serviceItem.create({ data });
    }
    async update(id, data) {
        if (data.defaultPrice &&
            data.minimumPrice &&
            data.defaultPrice < data.minimumPrice) {
            throw new common_1.BadRequestException('Default price cannot be less than minimum price');
        }
        return this.prisma.serviceItem.update({ where: { id }, data });
    }
};
exports.ServiceItemsService = ServiceItemsService;
exports.ServiceItemsService = ServiceItemsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ServiceItemsService);
//# sourceMappingURL=catalog.services.js.map