import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { TimelineService } from '../timeline/timeline.service';

@Injectable()
export class LeadsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private timeline: TimelineService,
  ) {}

  async findAll() {
    return this.prisma.lead.findMany({
      include: {
        customer: true,
        contact: true,
        assignedTo: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        customer: true,
        contact: true,
        assignedTo: { select: { id: true, name: true } },
        followUps: { orderBy: { followUpDate: 'asc' } },
      },
    });
    if (!lead) throw new NotFoundException();
    return lead;
  }

  async create(data: any, actorId: string, companyId: string) {
    // Generate enquiryNumber if missing
    if (!data.enquiryNumber) {
      const count = await this.prisma.lead.count({ where: { companyId } });
      const year = new Date().getFullYear();
      data.enquiryNumber = `ENQ-${year}-${(count + 1).toString().padStart(3, '0')}`;
    }

    const lead = await this.prisma.lead.create({
      data: {
        ...data,
        companyId,
      },
    });

    await this.audit.logEvent({
      actorId,
      action: 'CREATE',
      module: 'Leads',
      entityType: 'Lead',
      entityId: lead.id,
      newValue: data,
    });

    await this.timeline.logEvent({
      customerId: lead.customerId,
      title: 'Enquiry / Lead Created',
      description: `Lead ${lead.enquiryNumber} created for ${data.projectTitle}`,
      action: 'LEAD_CREATED',
      entityType: 'LEAD',
      entityId: lead.id,
      userId: actorId,
    });

    return lead;
  }

  async update(id: string, data: any, actorId: string) {
    const old = await this.prisma.lead.findUnique({ where: { id } });
    if (!old) throw new NotFoundException();

    const lead = await this.prisma.lead.update({
      where: { id },
      data,
    });

    await this.audit.logEvent({
      actorId,
      action: 'UPDATE',
      module: 'Leads',
      entityType: 'Lead',
      entityId: id,
      oldValue: old,
      newValue: data,
    });

    if (old.status !== lead.status) {
      await this.timeline.logEvent({
        customerId: lead.customerId,
        title: 'Lead Status Updated',
        description: `Lead ${lead.enquiryNumber} status changed from ${old.status} to ${lead.status}`,
        action: 'LEAD_STATUS_CHANGED',
        entityType: 'LEAD',
        entityId: lead.id,
        userId: actorId,
      });
    }

    return lead;
  }
}
