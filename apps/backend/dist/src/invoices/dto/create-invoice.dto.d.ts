import { InvoiceType, ItemType, DiscountType, PaymentMethod } from '@prisma/client';
export declare class InvoiceItemDto {
    itemType: ItemType;
    productId?: string;
    serviceItemId?: string;
    description: string;
    quantity?: number;
    unit?: string;
    unitPrice?: number;
    discountType?: DiscountType;
    discountValue?: number;
    taxRate?: number;
    sortOrder?: number;
}
export declare class CreateInvoiceDto {
    companyId: string;
    branchId?: string;
    customerId: string;
    contactId?: string;
    serviceTypeId?: string;
    invoiceType: InvoiceType;
    currency?: string;
    dueDate?: string;
    notes?: string;
    terms?: string;
    items?: InvoiceItemDto[];
}
export declare class RecordPaymentDto {
    amount: number;
    paymentMethod: PaymentMethod;
    referenceNumber?: string;
    notes?: string;
    attachmentUrl?: string;
    paymentDate?: string;
}
