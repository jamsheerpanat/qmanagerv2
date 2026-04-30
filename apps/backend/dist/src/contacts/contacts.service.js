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
exports.ContactsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const timeline_service_1 = require("../timeline/timeline.service");
let ContactsService = class ContactsService {
    prisma;
    timeline;
    constructor(prisma, timeline) {
        this.prisma = prisma;
        this.timeline = timeline;
    }
    async create(customerId, data, actorId) {
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
    async update(id, data) {
        return this.prisma.contact.update({
            where: { id },
            data,
        });
    }
    async remove(id) {
        return this.prisma.contact.delete({ where: { id } });
    }
};
exports.ContactsService = ContactsService;
exports.ContactsService = ContactsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        timeline_service_1.TimelineService])
], ContactsService);
//# sourceMappingURL=contacts.service.js.map