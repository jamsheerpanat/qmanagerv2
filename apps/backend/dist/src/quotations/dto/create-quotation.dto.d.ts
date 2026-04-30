import { ItemType, DiscountType } from '@prisma/client';
export declare class CreateQuotationDto {
    companyId: string;
    branchId?: string;
    customerId: string;
    contactId?: string;
    leadId?: string;
    serviceTypeId: string;
    quotationTemplateId?: string;
    projectTitle?: string;
    projectLocation?: string;
    requirementSummary?: string;
    proposedSolution?: string;
    scopeSummary?: string;
    validUntil?: Date;
    currency?: string;
    discountType?: DiscountType;
    discountValue?: number;
    internalNotes?: string;
}
export declare class QuotationItemDto {
    itemType: ItemType;
    productId?: string;
    serviceItemId?: string;
    sectionTitle?: string;
    description?: string;
    image?: string;
    quantity?: number;
    unit?: string;
    unitPrice?: number;
    discountType?: DiscountType;
    discountValue?: number;
    taxRate?: number;
    warranty?: string;
    deliveryTime?: string;
    remarks?: string;
    isOptional?: boolean;
    sortOrder?: number;
}
export declare class QuotationScopeDto {
    sectionTitle: string;
    content: string;
    isHidden?: boolean;
    sortOrder?: number;
}
export declare class QuotationTermDto {
    categoryId?: string;
    content: string;
    sortOrder?: number;
}
