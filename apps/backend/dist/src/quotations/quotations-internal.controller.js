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
exports.QuotationsInternalController = void 0;
const common_1 = require("@nestjs/common");
const quotations_service_1 = require("./quotations.service");
let QuotationsInternalController = class QuotationsInternalController {
    quotationsService;
    constructor(quotationsService) {
        this.quotationsService = quotationsService;
    }
    async findOneForPdf(id, internalHeader) {
        if (internalHeader !== '1') {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.quotationsService.findOne(id);
    }
};
exports.QuotationsInternalController = QuotationsInternalController;
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('x-internal-pdf-render')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], QuotationsInternalController.prototype, "findOneForPdf", null);
exports.QuotationsInternalController = QuotationsInternalController = __decorate([
    (0, common_1.Controller)('internal/quotations'),
    __metadata("design:paramtypes", [quotations_service_1.QuotationsService])
], QuotationsInternalController);
//# sourceMappingURL=quotations-internal.controller.js.map