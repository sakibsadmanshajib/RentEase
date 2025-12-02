import { IsDateString, IsNumber, IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateLeaseDto {
    @IsDateString()
    startDate!: Date;

    @IsDateString()
    endDate!: Date;

    @IsNumber()
    rentAmount!: number;

    @IsUUID()
    propertyId!: string;

    @IsString()
    tenantId!: string;

    @IsOptional()
    @IsUUID()
    unitId?: string;
}
