import { IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateInvoiceDto {
    @IsNumber()
    @IsOptional()
    amount?: number;

    @IsString()
    @IsOptional()
    status?: string;

    @IsDateString()
    @IsOptional()
    dueDate?: Date;
}
