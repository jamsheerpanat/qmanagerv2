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
exports.LeadsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const timeline_service_1 = require("../timeline/timeline.service");
let LeadsService = class LeadsService {
    prisma;
    audit;
    timeline;
    constructor(prisma, audit, timeline) {
        this.prisma = prisma;
        this.audit = audit;
        this.timeline = timeline;
    }
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
    async findOne(id) {
        const lead = await this.prisma.lead.findUnique({
            where: { id },
            include: {
                customer: true,
                contact: true,
                assignedTo: { select: { id: true, name: true } },
                followUps: { orderBy: { followUpDate: 'asc' } },
            },
        });
        if (!lead)
            throw new common_1.NotFoundException();
        return lead;
    }
    async create(data, actorId, companyId) {
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
    async update(id, data, actorId) {
        const old = await this.prisma.lead.findUnique({ where: { id } });
        if (!old)
            throw new common_1.NotFoundException();
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
};
exports.LeadsService = LeadsService;
exports.LeadsService = LeadsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        timeline_service_1.TimelineService])
], LeadsService);
//# sourceMappingURL=leads.service.js.map