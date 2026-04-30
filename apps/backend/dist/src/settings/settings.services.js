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
exports.QuotationTemplatesService = exports.BankAccountsService = exports.CompanySettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CompanySettingsService = class CompanySettingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCompany(id) {
        const company = await this.prisma.company.findUnique({
            where: { id },
            include: { bankAccounts: true },
        });
        if (!company)
            throw new common_1.NotFoundException();
        return company;
    }
    async updateCompany(id, data) {
        return this.prisma.company.update({
            where: { id },
            data,
        });
    }
};
exports.CompanySettingsService = CompanySettingsService;
exports.CompanySettingsService = CompanySettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CompanySettingsService);
let BankAccountsService = class BankAccountsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(companyId, data) {
        if (data.isDefault) {
            await this.prisma.bankAccount.updateMany({
                where: { companyId },
                data: { isDefault: false },
            });
        }
        return this.prisma.bankAccount.create({ data: { ...data, companyId } });
    }
    async update(id, data) {
        const bank = await this.prisma.bankAccount.findUnique({ where: { id } });
        if (!bank)
            throw new common_1.NotFoundException();
        if (data.isDefault) {
            await this.prisma.bankAccount.updateMany({
                where: { companyId: bank.companyId },
                data: { isDefault: false },
            });
        }
        return this.prisma.bankAccount.update({ where: { id }, data });
    }
    async remove(id) {
        return this.prisma.bankAccount.delete({ where: { id } });
    }
};
exports.BankAccountsService = BankAccountsService;
exports.BankAccountsService = BankAccountsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BankAccountsService);
let QuotationTemplatesService = class QuotationTemplatesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.quotationTemplate.findMany({
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        const tmpl = await this.prisma.quotationTemplate.findUnique({
            where: { id },
        });
        if (!tmpl)
            throw new common_1.NotFoundException();
        return tmpl;
    }
    async create(data) {
        return this.prisma.quotationTemplate.create({ data });
    }
    async update(id, data) {
        return this.prisma.quotationTemplate.update({ where: { id }, data });
    }
};
exports.QuotationTemplatesService = QuotationTemplatesService;
exports.QuotationTemplatesService = QuotationTemplatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QuotationTemplatesService);
//# sourceMappingURL=settings.services.js.map