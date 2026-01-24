import { IsString, IsNotEmpty, IsNumber, IsUUID, IsDateString, IsOptional, IsBoolean } from 'class-validator';

/**
 * DTO for creating an expense.
 * Note: orgId is NOT accepted in requests - it is automatically injected
 * from the JWT token via Sequelize @BeforeCreate hook.
 */
export class CreateExpenseDto {
    @IsUUID()
    @IsOptional()
    propertyId?: string;

    @IsUUID()
    @IsOptional()
    unitId?: string;

    @IsString()
    @IsNotEmpty()
    category!: string;

    @IsString()
    @IsNotEmpty()
    description!: string;

    @IsNumber()
    @IsNotEmpty()
    amount!: number;

    @IsString()
    @IsNotEmpty()
    currency!: string;

    @IsDateString()
    @IsOptional()
    date?: Date;

    @IsBoolean()
    @IsOptional()
    isRecurring?: boolean;

    @IsString()
    @IsOptional()
    recurrenceType?: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';

    @IsNumber()
    @IsOptional()
    recurrenceInterval?: number;

    @IsDateString()
    @IsOptional()
    recurrenceEndDate?: Date;

    @IsNumber()
    @IsOptional()
    recurrenceMaxOccurrences?: number;

    @IsNumber()
    @IsOptional()
    recurrenceDayOfMonth?: number;

    @IsNumber()
    @IsOptional()
    recurrenceDayOfWeek?: number;
}

