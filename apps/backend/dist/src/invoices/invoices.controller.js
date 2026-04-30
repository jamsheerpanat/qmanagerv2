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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesController = void 0;
const common_1 = require("@nestjs/common");
const invoices_service_1 = require("./invoices.service");
const create_invoice_dto_1 = require("./dto/create-invoice.dto");
const update_invoice_dto_1 = require("./dto/update-invoice.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const permissions_decorator_1 = require("../common/decorators/permissions.decorator");
const client_1 = require("@prisma/client");
let InvoicesController = class InvoicesController {
    invoicesService;
    constructor(invoicesService) {
        this.invoicesService = invoicesService;
    }
    create(dto, req) {
        return this.invoicesService.create(dto, req.user.id);
    }
    createFromQuotation(quotationId, type, req) {
        return this.invoicesService.createFromQuotation(quotationId, type || client_1.InvoiceType.QUOTATION, req.user.id);
    }
    findAll(req, filters) {
        return this.invoicesService.findAll(req.user.companyId, filters);
    }
    findOne(id) {
        return this.invoicesService.findOne(id);
    }
    update(id, dto) {
        return this.invoicesService.update(id, dto);
    }
    updateItems(id, items) {
        return this.invoicesService.replaceItems(id, items);
    }
    issue(id) {
        return this.invoicesService.issue(id);
    }
    recordPayment(id, dto, req) {
        return this.invoicesService.recordPayment(id, dto, req.user.id);
    }
    generatePdf(id, req) {
        return this.invoicesService.generatePdf(id, req.user.id);
    }
};
exports.InvoicesController = InvoicesController;
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('invoices.create'),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_invoice_dto_1.CreateInvoiceDto, Object]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "create", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('invoices.create'),
    (0, common_1.Post)('from-quotation/:quotationId'),
    __param(0, (0, common_1.Param)('quotationId')),
    __param(1, (0, common_1.Body)('invoiceType')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "createFromQuotation", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('invoices.view'),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "findAll", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('invoices.view'),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "findOne", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('invoices.update'),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_invoice_dto_1.UpdateInvoiceDto]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "update", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('invoices.update'),
    (0, common_1.Patch)(':id/items'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "updateItems", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('invoices.create'),
    (0, common_1.Post)(':id/issue'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "issue", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('invoices.record_payment'),
    (0, common_1.Post)(':id/payments'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_invoice_dto_1.RecordPaymentDto, Object]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "recordPayment", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('invoices.generate_pdf'),
    (0, common_1.Post)(':id/generate-pdf'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "generatePdf", null);
exports.InvoicesController = InvoicesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('invoices'),
    __metadata("design:paramtypes", [invoices_service_1.InvoicesService])
], InvoicesController);
//# sourceMappingURL=invoices.controller.js.map