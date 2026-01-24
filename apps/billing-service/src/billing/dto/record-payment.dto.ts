import { IsString, IsNotEmpty, IsNumber, IsUUID, IsDateString, IsOptional } from 'class-validator';

export class RecordPaymentDto {
    @IsUUID()
    @IsNotEmpty()
    invoiceId!: string;

    @IsUUID()
    @IsNotEmpty()
    orgId!: string;

    @IsNumber()
    amount!: number;

    @IsString()
    method!: string;

    @IsDateString()
    date!: Date;

    @IsString()
    @IsOptional()
    reference?: string;
}
