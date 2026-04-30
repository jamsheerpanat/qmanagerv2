"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const playwright_1 = require("playwright");
const prisma_service_1 = require("../prisma/prisma.service");
const minio_service_1 = require("../minio/minio.service");
const crypto = __importStar(require("crypto"));
let PdfProcessor = class PdfProcessor extends bullmq_1.WorkerHost {
    prisma;
    minio;
    constructor(prisma, minio) {
        super();
        this.prisma = prisma;
        this.minio = minio;
    }
    async process(job) {
        const { documentId, templateId, userId, customerName, totalAmount, quotationId } = job.data;
        const SERVICE_TEMPLATE_ROUTES = {
            'home-automation': 'home-automation',
            'smart-home': 'home-automation',
            'smart-home-automation': 'home-automation',
            'building-automation': 'building-automation',
            'bms': 'building-automation',
            'software-development': 'software-development',
            'software': 'software-development',
            'web-development': 'software-development',
            'it-infrastructure': 'it-infrastructure',
            'it-infra': 'it-infrastructure',
            'network': 'it-infrastructure',
        };
        const routeSegment = SERVICE_TEMPLATE_ROUTES[templateId] || templateId;
        const qParam = quotationId ? `&quotationId=${quotationId}` : '';
        const renderUrl = `http://localhost:3000/render-pdf/${routeSegment}?docId=${documentId}${qParam}`;
        try {
            const browser = await playwright_1.chromium.launch({ headless: true });
            const page = await browser.newPage();
            await page.goto(renderUrl, { waitUntil: 'networkidle' });
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                preferCSSPageSize: true,
                margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
            });
            await browser.close();
            const hash = crypto.createHash('sha256').update(pdfBuffer).digest('hex');
            const fileName = `document-${documentId}-${Date.now()}.pdf`;
            await this.minio.uploadFile(fileName, Buffer.from(pdfBuffer), 'application/pdf');
            const token = crypto.randomBytes(16).toString('hex');
            await this.prisma.$transaction(async (tx) => {
                await tx.document.update({
                    where: { id: documentId },
                    data: {
                        status: 'PUBLISHED',
                        pdfUrl: fileName,
                        metadata: {
                            hash,
                            customerName,
                            totalAmount,
                        },
                    },
                });
                await tx.documentVerification.create({
                    data: {
                        documentId: documentId,
                        token,
                    },
                });
            });
            return { success: true, fileName, hash, token };
        }
        catch (error) {
            console.error(`Error processing PDF job ${job.id}:`, error);
            await this.prisma.document.update({
                where: { id: documentId },
                data: { status: 'FAILED' },
            });
            throw error;
        }
    }
};
exports.PdfProcessor = PdfProcessor;
exports.PdfProcessor = PdfProcessor = __decorate([
    (0, bullmq_1.Processor)('pdf-generation'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        minio_service_1.MinioService])
], PdfProcessor);
//# sourceMappingURL=pdf.processor.js.map