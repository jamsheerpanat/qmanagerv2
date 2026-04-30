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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const timeline_service_1 = require("../timeline/timeline.service");
let CustomersService = class CustomersService {
    prisma;
    audit;
    timeline;
    constructor(prisma, audit, timeline) {
        this.prisma = prisma;
        this.audit = audit;
        this.timeline = timeline;
    }
    async findAll() {
        return this.prisma.customer.findMany({
            include: {
                contacts: { where: { isPrimary: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const customer = await this.prisma.customer.findUnique({
            where: { id },
            include: { contacts: true, leads: true },
        });
        if (!customer)
            throw new common_1.NotFoundException();
        return customer;
    }
    async create(data, actorId, companyId) {
        const { contacts, ...customerData } = data;
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
    async update(id, data, actorId) {
        const old = await this.prisma.customer.findUnique({ where: { id } });
        if (!old)
            throw new common_1.NotFoundException();
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
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        timeline_service_1.TimelineService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map