import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompanySettingsService {
  constructor(private prisma: PrismaService) {}

  async getCompany(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: { bankAccounts: true },
    });
    if (!company) throw new NotFoundException();
    return company;
  }

  async updateCompany(id: string, data: any) {
    return this.prisma.company.update({
      where: { id },
      data,
    });
  }
}

@Injectable()
export class BankAccountsService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, data: any) {
    if (data.isDefault) {
      // Unset previous defaults
      await this.prisma.bankAccount.updateMany({
        where: { companyId },
        data: { isDefault: false },
      });
    }
    return this.prisma.bankAccount.create({ data: { ...data, companyId } });
  }

  async update(id: string, data: any) {
    const bank = await this.prisma.bankAccount.findUnique({ where: { id } });
    if (!bank) throw new NotFoundException();

    if (data.isDefault) {
      await this.prisma.bankAccount.updateMany({
        where: { companyId: bank.companyId },
        data: { isDefault: false },
      });
    }
    return this.prisma.bankAccount.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.bankAccount.delete({ where: { id } });
  }
}

@Injectable()
export class QuotationTemplatesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.quotationTemplate.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const tmpl = await this.prisma.quotationTemplate.findUnique({
      where: { id },
    });
    if (!tmpl) throw new NotFoundException();
    return tmpl;
  }

  async create(data: any) {
    return this.prisma.quotationTemplate.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.quotationTemplate.update({ where: { id }, data });
  }
}
