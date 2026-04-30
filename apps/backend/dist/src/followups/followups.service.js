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
exports.FollowUpsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const timeline_service_1 = require("../timeline/timeline.service");
let FollowUpsService = class FollowUpsService {
    prisma;
    timeline;
    constructor(prisma, timeline) {
        this.prisma = prisma;
        this.timeline = timeline;
    }
    async create(leadId, data, actorId) {
        const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
        if (!lead)
            throw new common_1.NotFoundException('Lead not found');
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
    async complete(id, actorId) {
        const followUp = await this.prisma.followUp.findUnique({
            where: { id },
            include: { lead: true },
        });
        if (!followUp)
            throw new common_1.NotFoundException();
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
};
exports.FollowUpsService = FollowUpsService;
exports.FollowUpsService = FollowUpsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        timeline_service_1.TimelineService])
], FollowUpsService);
//# sourceMappingURL=followups.service.js.map