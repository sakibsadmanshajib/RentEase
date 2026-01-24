import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUUID, IsDateString, IsEnum } from 'class-validator';

/**
 * DTO for creating an invoice.
 * Note: orgId is NOT accepted in requests - it is automatically injected
 * from the JWT token via Sequelize @BeforeCreate hook.
 */
export class CreateInvoiceDto {
    @IsUUID()
    @IsOptional()
    leaseId?: string;

    @IsNumber()
    @IsNotEmpty()
    amount!: number;

    @IsString()
    @IsNotEmpty()
    currency!: string;

    @IsDateString()
    @IsNotEmpty()
    dueDate!: Date;

    @IsString()
    @IsNotEmpty()
    description!: string;

    @IsEnum(['RENT', 'UTILITY', 'FEE', 'OTHER'])
    @IsNotEmpty()
    type!: string;

    @IsOptional()
    metadata?: Record<string, any>;
}

