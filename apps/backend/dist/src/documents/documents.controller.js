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
exports.DocumentsController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const minio_service_1 = require("../minio/minio.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let DocumentsController = class DocumentsController {
    prisma;
    minio;
    constructor(prisma, minio) {
        this.prisma = prisma;
        this.minio = minio;
    }
    async getDocument(id) {
        const document = await this.prisma.document.findUnique({ where: { id } });
        if (!document)
            throw new common_1.NotFoundException();
        return document;
    }
    async downloadDocument(id, res) {
        const document = await this.prisma.document.findUnique({ where: { id } });
        if (!document || !document.pdfUrl)
            throw new common_1.NotFoundException();
        try {
            const stream = await this.minio.getFileStream(document.pdfUrl);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${document.referenceId}.pdf"`);
            stream.pipe(res);
        }
        catch (error) {
            throw new common_1.NotFoundException('File not found in storage');
        }
    }
    async verifyDocument(token) {
        const verification = await this.prisma.documentVerification.findUnique({
            where: { token },
            include: { document: true },
        });
        if (!verification) {
            throw new common_1.NotFoundException('Invalid verification token');
        }
        const metadata = verification.document.metadata || {};
        return {
            documentId: verification.document.id,
            referenceId: verification.document.referenceId,
            status: verification.document.status,
            type: verification.document.type,
            createdAt: verification.document.createdAt,
            verifiedAt: new Date(),
            customerName: metadata.customerName || 'N/A',
            totalAmount: metadata.totalAmount || 0,
            hash: metadata.hash || 'N/A',
            revision: metadata.revision || 1,
        };
    }
};
exports.DocumentsController = DocumentsController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('documents/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "getDocument", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('documents/:id/download'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "downloadDocument", null);
__decorate([
    (0, common_1.Get)('verify/:token'),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "verifyDocument", null);
exports.DocumentsController = DocumentsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        minio_service_1.MinioService])
], DocumentsController);
//# sourceMappingURL=documents.controller.js.map