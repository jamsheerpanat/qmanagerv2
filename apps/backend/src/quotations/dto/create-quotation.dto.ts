import { Type } from 'class-transformer';
import { 
  IsString, IsOptional, IsUUID, IsNumber, IsEnum, IsBoolean, IsArray, ValidateNested 
} from 'class-validator';
import { QuotationStatus, ItemType, DiscountType } from '@prisma/client';

export class CreateQuotationDto {
  @IsUUID()
  companyId: string;

  @IsUUID()
  @IsOptional()
  branchId?: string;

  @IsUUID()
  customerId: string;

  @IsUUID()
  @IsOptional()
  contactId?: string;

  @IsUUID()
  @IsOptional()
  leadId?: string;

  @IsUUID()
  serviceTypeId: string;

  @IsUUID()
  @IsOptional()
  quotationTemplateId?: string;

  @IsString()
  @IsOptional()
  projectTitle?: string;

  @IsString()
  @IsOptional()
  projectLocation?: string;

  @IsString()
  @IsOptional()
  requirementSummary?: string;

  @IsString()
  @IsOptional()
  proposedSolution?: string;

  @IsString()
  @IsOptional()
  scopeSummary?: string;

  @IsOptional()
  validUntil?: Date;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsEnum(DiscountType)
  @IsOptional()
  discountType?: DiscountType;

  @IsNumber()
  @IsOptional()
  discountValue?: number;

  @IsString()
  @IsOptional()
  internalNotes?: string;
}

export class QuotationItemDto {
  @IsEnum(ItemType)
  itemType: ItemType;

  @IsUUID()
  @IsOptional()
  productId?: string;

  @IsUUID()
  @IsOptional()
  serviceItemId?: string;

  @IsString()
  @IsOptional()
  sectionTitle?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsNumber()
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  @IsOptional()
  unitPrice?: number;

  @IsEnum(DiscountType)
  @IsOptional()
  discountType?: DiscountType;

  @IsNumber()
  @IsOptional()
  discountValue?: number;

  @IsNumber()
  @IsOptional()
  taxRate?: number;

  @IsString()
  @IsOptional()
  warranty?: string;

  @IsString()
  @IsOptional()
  deliveryTime?: string;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsBoolean()
  @IsOptional()
  isOptional?: boolean;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

export class QuotationScopeDto {
  @IsString()
  sectionTitle: string;

  @IsString()
  content: string;

  @IsBoolean()
  @IsOptional()
  isHidden?: boolean;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

export class QuotationTermDto {
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsString()
  content: string;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}
