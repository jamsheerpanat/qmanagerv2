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
exports.PdfController = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const prisma_service_1 = require("../prisma/prisma.service");
let PdfController = class PdfController {
    pdfQueue;
    prisma;
    constructor(pdfQueue, prisma) {
        this.pdfQueue = pdfQueue;
        this.prisma = prisma;
    }
    async generateSample(body, req) {
        const { templateId, customerName, totalAmount } = body;
        const document = await this.prisma.document.create({
            data: {
                type: 'QUOTATION',
                referenceId: `SAMPLE-${templateId}-${Date.now()}`,
                status: 'PROCESSING',
            },
        });
        await this.pdfQueue.add('generate-pdf', {
            documentId: document.id,
            templateId,
            userId: req.user.id,
            customerName: customerName || 'Sample Customer LLC',
            totalAmount: totalAmount || 25000,
        });
        return {
            success: true,
            documentId: document.id,
            message: 'PDF generation queued',
        };
    }
};
exports.PdfController = PdfController;
__decorate([
    (0, common_1.Post)('sample-quotation'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PdfController.prototype, "generateSample", null);
exports.PdfController = PdfController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('pdf'),
    __param(0, (0, bullmq_1.InjectQueue)('pdf-generation')),
    __metadata("design:paramtypes", [bullmq_2.Queue,
        prisma_service_1.PrismaService])
], PdfController);
//# sourceMappingURL=pdf.controller.js.map