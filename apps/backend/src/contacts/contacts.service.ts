import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TimelineService } from '../timeline/timeline.service';

@Injectable()
export class ContactsService {
  constructor(
    private prisma: PrismaService,
    private timeline: TimelineService,
  ) {}

  async create(customerId: string, data: any, actorId: string) {
    const contact = await this.prisma.contact.create({
      data: { ...data, customerId },
    });

    await this.timeline.logEvent({
      customerId,
      title: 'New Contact Added',
      description: `Contact ${data.name} was added.`,
      action: 'CONTACT_ADDED',
      userId: actorId,
    });

    return contact;
  }

  async update(id: string, data: any) {
    return this.prisma.contact.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.contact.delete({ where: { id } });
  }
}
