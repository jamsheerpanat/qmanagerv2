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

@Injectable()
export class TermsGroupsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.termsGroup.findMany({
      include: { templates: true },
      orderBy: { name: 'asc' },
    });
  }

  async create(data: any) {
    const { templateIds, id, ...rest } = data;
    return this.prisma.termsGroup.create({
      data: {
        ...rest,
        templates: {
          connect: templateIds?.map((id: string) => ({ id })) || [],
        },
      },
    });
  }

  async update(id: string, data: any) {
    const { templateIds, ...rest } = data;
    const updateData: any = { ...rest };
    
    if (templateIds) {
      updateData.templates = {
        set: templateIds.map((tid: string) => ({ id: tid })),
      };
    }

    return this.prisma.termsGroup.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    return this.prisma.termsGroup.delete({ where: { id } });
  }
}
