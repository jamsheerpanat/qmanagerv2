import { CreateQuotationDto } from './create-quotation.dto';
import { QuotationStatus } from '@prisma/client';
declare const UpdateQuotationDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateQuotationDto>>;
export declare class UpdateQuotationDto extends UpdateQuotationDto_base {
    status?: QuotationStatus;
}
export {};
