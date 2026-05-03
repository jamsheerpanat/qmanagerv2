import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class PortalService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async getQuotationByToken(
    token: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const share = await this.prisma.quotationShare.findUnique({
      where: { token },
      include: {
        quotation: {
          include: { items: true, company: true, customer: true, terms: true, serviceType: true },
        },
      },
    });

    if (!share) throw new NotFoundException('Invalid or expired link');

    if (share.expiresAt && share.expiresAt < new Date()) {
      throw new ForbiddenException('This link has expired');
    }

    // Update tracking
    const updateData: any = { viewedAt: new Date(), lastViewedAt: new Date() };
    if (!share.firstViewedAt) {
      updateData.firstViewedAt = new Date();

      // Auto-notify sales/manager that customer viewed it for the first time
      await this.notificationsService.createNotification({
        companyId: share.quotation.companyId,
        title: 'Quotation Viewed',
        message: `Customer viewed quotation ${share.quotation.quotationNumber} for the first time.`,
        type: NotificationType.QUOTATION,
        referenceId: share.quotation.id,
      });
    }

    if (ipAddress) updateData.ipAddress = ipAddress;
    if (userAgent) updateData.userAgent = userAgent;

    await this.prisma.quotationShare.update({
      where: { id: share.id },
      data: updateData,
    });

    return share;
  }

  async acceptQuotation(
    token: string,
    dto: any,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const share = await this.getQuotationByToken(token); // Reuses validation
    const q = share.quotation;

    if (q.status !== 'APPROVED' && q.status !== 'SENT_TO_CUSTOMER') {
      throw new BadRequestException(
        'Quotation cannot be accepted in its current state',
      );
    }

    const acceptance = await this.prisma.quotationAcceptance.create({
      data: {
        quotationId: q.id,
        revisionNumber: q.revisionNumber,
        acceptedByName: dto.acceptedByName,
        designation: dto.designation,
        email: dto.email,
        phone: dto.phone,
        digitalSignatureData: dto.digitalSignatureData,
        acceptanceNote: dto.acceptanceNote,
        ipAddress,
        userAgent,
      },
    });

    await this.prisma.quotation.update({
      where: { id: q.id },
      data: { status: 'ACCEPTED' },
    });

    // Notify internal users
    await this.notificationsService.createNotification({
      companyId: q.companyId,
      title: 'Quotation Accepted 🎉',
      message: `${dto.acceptedByName} accepted quotation ${q.quotationNumber} Rev ${q.revisionNumber}.`,
      type: NotificationType.QUOTATION,
      referenceId: q.id,
    });

    return acceptance;
  }

  async rejectQuotation(
    token: string,
    dto: any,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const share = await this.getQuotationByToken(token); // Reuses validation
    const q = share.quotation;

    if (q.status !== 'APPROVED' && q.status !== 'SENT_TO_CUSTOMER') {
      throw new BadRequestException(
        'Quotation cannot be rejected in its current state',
      );
    }

    const rejection = await this.prisma.quotationRejection.create({
      data: {
        quotationId: q.id,
        revisionNumber: q.revisionNumber,
        rejectedByName: dto.rejectedByName,
        reason: dto.reason,
        note: dto.note,
        ipAddress,
        userAgent,
      },
    });

    await this.prisma.quotation.update({
      where: { id: q.id },
      data: { status: 'REJECTED' },
    });

    await this.notificationsService.createNotification({
      companyId: q.companyId,
      title: 'Quotation Rejected ❌',
      message: `${dto.rejectedByName} rejected quotation ${q.quotationNumber}. Reason: ${dto.reason}`,
      type: NotificationType.QUOTATION,
      referenceId: q.id,
    });

    return rejection;
  }

  async getInvoiceByToken(
    token: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const share = await this.prisma.invoiceShare.findUnique({
      where: { token },
      include: {
        invoice: {
          include: {
            items: true,
            company: true,
            customer: true,
            payments: { orderBy: { paymentDate: 'desc' } },
          },
        },
      },
    });

    if (!share) throw new NotFoundException('Invalid or expired link');

    const updateData: any = { viewedAt: new Date(), lastViewedAt: new Date() };
    if (!share.firstViewedAt) updateData.firstViewedAt = new Date();
    if (ipAddress) updateData.ipAddress = ipAddress;
    if (userAgent) updateData.userAgent = userAgent;

    await this.prisma.invoiceShare.update({
      where: { id: share.id },
      data: updateData,
    });

    return share;
  }

  async uploadPaymentProof(token: string, dto: any) {
    const share = await this.getInvoiceByToken(token);
    const invoice = share.invoice;

    const payment = await this.prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: dto.amount,
        paymentMethod: dto.paymentMethod,
        referenceNumber: dto.referenceNumber,
        notes: dto.notes,
        attachmentUrl: dto.attachmentUrl,
        isVerified: false,
      },
    });

    await this.notificationsService.createNotification({
      companyId: invoice.companyId,
      title: 'Payment Proof Uploaded 💰',
      message: `A payment proof of ${dto.amount} was uploaded for invoice ${invoice.invoiceNumber}. Please verify it.`,
      type: NotificationType.PAYMENT,
      referenceId: invoice.id,
    });

    return payment;
  }

  async verifyDocument(token: string) {
    // Determine if token is a document verification hash or share token
    // The prompt specifies: "verify someone with QR token against document"
    // Usually we hash the document content. The DB has `Document` model with `fileHash` or `referenceId`.
    // Let's assume the QR token on the PDF is the `id` of the Document itself or `fileHash`.

    const doc = await this.prisma.document.findFirst({
      where: {
        OR: [{ id: token }, { fileHash: token }],
      },
    });

    if (!doc) throw new NotFoundException('Invalid Verification Token');

    // Return verification info
    return {
      documentType: doc.type,
      referenceId: doc.referenceId,
      generatedAt: doc.createdAt,
      fileHash: doc.fileHash,
      metadata: doc.metadata,
      status: 'Valid', // Could compute logic for EXPIRED based on metadata
    };
  }
}
