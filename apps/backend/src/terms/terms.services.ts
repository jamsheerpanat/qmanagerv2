import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TermsCategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.termsCategory.findMany({
      include: { templates: true },
      orderBy: { name: 'asc' },
    });
  }

  async create(data: any) {
    return this.prisma.termsCategory.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.termsCategory.update({ where: { id }, data });
  }
}

@Injectable()
export class TermsTemplatesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.termsTemplate.findMany({
      include: { category: true, serviceType: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async create(data: any) {
    return this.prisma.termsTemplate.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.termsTemplate.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.termsTemplate.delete({ where: { id } });
  }
}
