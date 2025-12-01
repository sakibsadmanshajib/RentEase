import { IsString, IsNumber, IsOptional, IsBoolean, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExpenseDto {
    @IsString()
    tenantId!: string;

    @IsOptional()
    @IsString()
    propertyId?: string;

    @IsOptional()
    @IsString()
    unitId?: string;

    @IsString()
    category!: string;

    @IsString()
    description!: string;

    @IsNumber()
    amount!: number;

    @IsOptional()
    @IsString()
    currency?: string;

    @IsOptional()
    @IsDateString()
    date?: Date;

    // Recurrence fields
    @IsOptional()
    @IsBoolean()
    isRecurring?: boolean;

    @IsOptional()
    @IsString()
    recurrenceType?: string;

    @IsOptional()
    @IsNumber()
    recurrenceInterval?: number;

    @IsOptional()
    @IsNumber()
    recurrenceDayOfWeek?: number;

    @IsOptional()
    @IsNumber()
    recurrenceDayOfMonth?: number;

    @IsOptional()
    @IsDateString()
    recurrenceEndDate?: Date;

    @IsOptional()
    @IsNumber()
    recurrenceMaxOccurrences?: number;
}
