import { IsDateString, IsNumber, IsUUID, IsOptional } from 'class-validator';

/**
 * DTO for creating a lease.
 * Note: orgId is NOT accepted in requests - it is automatically injected
 * from the JWT token via Sequelize @BeforeValidate hook.
 */
export class CreateLeaseDto {
    @IsDateString()
    startDate!: Date;

    @IsDateString()
    endDate!: Date;

    @IsNumber()
    rentAmount!: number;

    @IsUUID()
    propertyId!: string;

    @IsOptional()
    @IsUUID()
    unitId?: string;
}

