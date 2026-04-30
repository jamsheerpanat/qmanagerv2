import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServiceTypesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.serviceType.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const serviceType = await this.prisma.serviceType.findUnique({
      where: { id },
      include: {
        categories: true,
        products: true,
        serviceItems: true,
        termsTemplates: true,
      },
    });
    if (!serviceType) throw new NotFoundException();
    return serviceType;
  }

  async create(data: any) {
    return this.prisma.serviceType.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.serviceType.update({ where: { id }, data });
  }
}

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.productCategory.findMany({
      include: { serviceType: true, parent: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(data: any) {
    return this.prisma.productCategory.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.productCategory.update({ where: { id }, data });
  }
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.product.findMany({
      include: { category: true, serviceType: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, serviceType: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(data: any) {
    if (data.sellingPrice < data.minimumSellingPrice) {
      throw new BadRequestException(
        'Selling price cannot be less than minimum selling price',
      );
    }
    return this.prisma.product.create({ data });
  }

  async update(id: string, data: any) {
    if (
      data.sellingPrice &&
      data.minimumSellingPrice &&
      data.sellingPrice < data.minimumSellingPrice
    ) {
      throw new BadRequestException(
        'Selling price cannot be less than minimum selling price',
      );
    }
    return this.prisma.product.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }
}

@Injectable()
export class ServiceItemsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.serviceItem.findMany({
      include: { serviceType: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: any) {
    if (data.defaultPrice < data.minimumPrice) {
      throw new BadRequestException(
        'Default price cannot be less than minimum price',
      );
    }
    return this.prisma.serviceItem.create({ data });
  }

  async update(id: string, data: any) {
    if (
      data.defaultPrice &&
      data.minimumPrice &&
      data.defaultPrice < data.minimumPrice
    ) {
      throw new BadRequestException(
        'Default price cannot be less than minimum price',
      );
    }
    return this.prisma.serviceItem.update({ where: { id }, data });
  }
}
