import { IsString, IsNumber, IsOptional, IsDateString, IsObject } from 'class-validator';

export class CreateInvoiceDto {
    @IsString()
    tenantId!: string;

    @IsOptional()
    @IsString()
    leaseId?: string;

    @IsOptional()
    @IsString()
    invoiceNumber?: string;

    @IsOptional()
    @IsDateString()
    issueDate?: Date;

    @IsDateString()
    dueDate!: Date;

    @IsOptional()
    @IsDateString()
    periodStart?: Date;

    @IsOptional()
    @IsDateString()
    periodEnd?: Date;

    @IsNumber()
    amount!: number;

    @IsOptional()
    @IsString()
    currency?: string;

    @IsOptional()
    @IsObject()
    lineItems?: any;
}
