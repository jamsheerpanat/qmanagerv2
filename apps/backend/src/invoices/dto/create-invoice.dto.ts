import { IsString, IsOptional, IsNumber, IsEnum, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceType, ItemType, DiscountType, PaymentMethod } from '@prisma/client';

export class InvoiceItemDto {
  @IsEnum(ItemType)
  itemType: ItemType;

  @IsOptional() @IsString()
  productId?: string;

  @IsOptional() @IsString()
  serviceItemId?: string;

  @IsString()
  description: string;

  @IsOptional() @IsNumber()
  quantity?: number;

  @IsOptional() @IsString()
  unit?: string;

  @IsOptional() @IsNumber()
  unitPrice?: number;

  @IsOptional() @IsEnum(DiscountType)
  discountType?: DiscountType;

  @IsOptional() @IsNumber()
  discountValue?: number;

  @IsOptional() @IsNumber()
  taxRate?: number;

  @IsOptional() @IsNumber()
  sortOrder?: number;
}

export class CreateInvoiceDto {
  @IsString()
  companyId: string;

  @IsOptional() @IsString()
  branchId?: string;

  @IsString()
  customerId: string;

  @IsOptional() @IsString()
  contactId?: string;

  @IsOptional() @IsString()
  serviceTypeId?: string;

  @IsEnum(InvoiceType)
  invoiceType: InvoiceType;

  @IsOptional() @IsString()
  currency?: string;

  @IsOptional() @IsDateString()
  dueDate?: string;

  @IsOptional() @IsString()
  notes?: string;

  @IsOptional() @IsString()
  terms?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items?: InvoiceItemDto[];
}

export class RecordPaymentDto {
  @IsNumber()
  amount: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional() @IsString()
  referenceNumber?: string;

  @IsOptional() @IsString()
  notes?: string;

  @IsOptional() @IsString()
  attachmentUrl?: string;

  @IsOptional() @IsDateString()
  paymentDate?: string;
}
