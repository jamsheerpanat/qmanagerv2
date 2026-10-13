import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TimelineService } from '../timeline/timeline.service';

@Injectable()
export class FollowUpsService {
  constructor(
    private prisma: PrismaService,
    private timeline: TimelineService,
  ) {}

  async create(leadId: string, data: any, actorId: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new NotFoundException('Lead not found');

    const followUp = await this.prisma.followUp.create({
      data: { ...data, leadId },
    });

    await this.timeline.logEvent({
      customerId: lead.customerId,
      title: 'Follow-up Scheduled',
      description: `A ${data.followUpType} was scheduled for lead ${lead.enquiryNumber}.`,
      action: 'FOLLOW_UP_ADDED',
      entityType: 'FOLLOW_UP',
      entityId: followUp.id,
      userId: actorId,
    });

    return followUp;
  }

  async complete(id: string, actorId: string) {
    const followUp = await this.prisma.followUp.findUnique({
      where: { id },
      include: { lead: true },
    });
    if (!followUp) throw new NotFoundException();

    const updated = await this.prisma.followUp.update({
      where: { id },
      data: {
        completedByUserId: actorId,
        completedAt: new Date(),
      },
    });

    await this.timeline.logEvent({
      customerId: followUp.lead.customerId,
      title: 'Follow-up Completed',
      description: `The ${followUp.followUpType} follow-up for lead ${followUp.lead.enquiryNumber} was completed.`,
      action: 'FOLLOW_UP_COMPLETED',
      entityType: 'FOLLOW_UP',
      entityId: followUp.id,
      userId: actorId,
    });

    return updated;
  }
}
