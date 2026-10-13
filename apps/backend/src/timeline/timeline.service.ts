import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TimelineService {
  constructor(private prisma: PrismaService) {}

  async logEvent(data: {
    customerId: string;
    title: string;
    description?: string;
    action: string;
    entityType?: string;
    entityId?: string;
    userId?: string;
  }) {
    return this.prisma.customerTimeline.create({
      data,
    });
  }

  async getTimeline(customerId: string) {
    return this.prisma.customerTimeline.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true } },
      },
    });
  }
}
