import { IsString, IsNumber, IsDateString, IsUUID } from 'class-validator';

export class RecordPaymentDto {
    @IsString()
    tenantId!: string;

    @IsUUID()
    invoiceId!: string;

    @IsNumber()
    amount!: number;

    @IsDateString()
    date!: Date;

    @IsString()
    method!: string;
}
