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
exports.QuotationsController = void 0;
const common_1 = require("@nestjs/common");
const quotations_service_1 = require("./quotations.service");
const create_quotation_dto_1 = require("./dto/create-quotation.dto");
const update_quotation_dto_1 = require("./dto/update-quotation.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../common/guards/permissions.guard");
const permissions_decorator_1 = require("../common/decorators/permissions.decorator");
let QuotationsController = class QuotationsController {
    quotationsService;
    constructor(quotationsService) {
        this.quotationsService = quotationsService;
    }
    create(createQuotationDto, req) {
        return this.quotationsService.create(createQuotationDto, req.user?.id);
    }
    findAll(req, query) {
        const { companyId } = req.user;
        return this.quotationsService.findAll(companyId, query);
    }
    findOne(id) {
        return this.quotationsService.findOne(id);
    }
    update(id, updateQuotationDto) {
        return this.quotationsService.update(id, updateQuotationDto);
    }
    remove(id) {
        return this.quotationsService.remove(id);
    }
    replaceItems(id, itemsDto) {
        return this.quotationsService.replaceItems(id, itemsDto);
    }
    replaceScopes(id, scopesDto) {
        return this.quotationsService.replaceScopes(id, scopesDto);
    }
    replaceTerms(id, termsDto) {
        return this.quotationsService.replaceTerms(id, termsDto);
    }
    submitForApproval(id, req) {
        return this.quotationsService.submitForApproval(id, req.user?.id);
    }
    approve(id, req, comments) {
        return this.quotationsService.approve(id, req.user?.id, comments);
    }
    reject(id, req, comments) {
        return this.quotationsService.reject(id, req.user?.id, comments);
    }
    createRevision(id, req) {
        return this.quotationsService.createRevision(id, req.user?.id);
    }
    compareRevisions(id, toId) {
        return this.quotationsService.compareRevisions(id, toId);
    }
    sendQuotation(id, email, req) {
        return this.quotationsService.sendQuotation(id, email, req.user?.id);
    }
    generatePdf(id, req) {
        return this.quotationsService.generatePdf(id, req.user?.id);
    }
    checkReadiness(id) {
        return this.quotationsService.checkReadiness(id);
    }
    aiSummarize(id) {
        return this.quotationsService.aiSummarize(id);
    }
};
exports.QuotationsController = QuotationsController;
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('quotations.create'),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_quotation_dto_1.CreateQuotationDto, Object]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "create", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('quotations.view'),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "findAll", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('quotations.view'),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "findOne", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('quotations.update'),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_quotation_dto_1.UpdateQuotationDto]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "update", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('quotations.update'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "remove", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('quotations.update'),
    (0, common_1.Post)(':id/items'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "replaceItems", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('quotations.update'),
    (0, common_1.Patch)(':id/scope'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "replaceScopes", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('quotations.update'),
    (0, common_1.Post)(':id/terms'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "replaceTerms", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('quotations.approve'),
    (0, common_1.Post)(':id/submit-for-approval'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "submitForApproval", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('quotations.approve'),
    (0, common_1.Post)(':id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)('comments')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "approve", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('quotations.approve'),
    (0, common_1.Post)(':id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)('comments')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "reject", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('quotations.revise'),
    (0, common_1.Post)(':id/create-revision'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "createRevision", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('quotations.view'),
    (0, common_1.Get)(':id/compare/:toId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('toId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "compareRevisions", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('quotations.send'),
    (0, common_1.Post)(':id/send'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('recipientEmail')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "sendQuotation", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('quotations.generate_pdf'),
    (0, common_1.Post)(':id/generate-pdf'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "generatePdf", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('quotations.view'),
    (0, common_1.Get)(':id/readiness'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "checkReadiness", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('quotations.update'),
    (0, common_1.Post)(':id/ai-summarize'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "aiSummarize", null);
exports.QuotationsController = QuotationsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('quotations'),
    __metadata("design:paramtypes", [quotations_service_1.QuotationsService])
], QuotationsController);
//# sourceMappingURL=quotations.controller.js.map