import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { TimelineService } from '../timeline/timeline.service';

@Injectable()
export class CustomersService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private timeline: TimelineService,
  ) {}

  /**
   * Scoped to the caller's company. This previously took no companyId at all,
   * so every tenant's customers were returned to every caller.
   */
  async findAll(companyId: string, limit?: number) {
    return this.prisma.customer.findMany({
      where: { companyId },
      include: {
        contacts: { where: { isPrimary: true } },
      },
      orderBy: { createdAt: 'desc' },
      ...(limit ? { take: limit } : {}),
    });
  }

  async findOne(id: string, companyId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, companyId },
      include: { contacts: true, leads: true },
    });
    if (!customer) throw new NotFoundException();
    return customer;
  }

  async create(data: any, actorId: string, companyId: string) {
    const { contacts, ...customerData } = data;

    // Auto generate customerCode if missing
    if (!customerData.customerCode) {
      const count = await this.prisma.customer.count({ where: { companyId } });
      customerData.customerCode = `CUS-${1000 + count + 1}`;
    }

    const customer = await this.prisma.customer.create({
      data: {
        ...customerData,
        companyId,
        contacts: contacts
          ? {
              create: contacts,
            }
          : undefined,
      },
    });

    await this.audit.logEvent({
      actorId,
      action: 'CREATE',
      module: 'Customers',
      entityType: 'Customer',
      entityId: customer.id,
      newValue: customerData,
    });

    await this.timeline.logEvent({
      customerId: customer.id,
      title: 'Customer Profile Created',
      action: 'CUSTOMER_CREATED',
      userId: actorId,
    });

    return customer;
  }

  async update(id: string, data: any, actorId: string) {
    const old = await this.prisma.customer.findUnique({ where: { id } });
    if (!old) throw new NotFoundException();

    const customer = await this.prisma.customer.update({
      where: { id },
      data,
    });

    await this.audit.logEvent({
      actorId,
      action: 'UPDATE',
      module: 'Customers',
      entityType: 'Customer',
      entityId: id,
      oldValue: old,
      newValue: data,
    });

    await this.timeline.logEvent({
      customerId: customer.id,
      title: 'Customer Profile Updated',
      action: 'CUSTOMER_UPDATED',
      userId: actorId,
    });

    return customer;
  }
}
