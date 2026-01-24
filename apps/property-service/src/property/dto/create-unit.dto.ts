import { IsNotEmpty, IsString, IsUUID, IsOptional } from 'class-validator';

/**
 * DTO for creating a unit.
 * Note: orgId is NOT accepted in requests - it is automatically injected
 * from the JWT token via Sequelize @BeforeValidate hook.
 */
export class CreateUnitDto {
    @IsUUID()
    @IsNotEmpty()
    propertyId!: string;

    @IsString()
    @IsNotEmpty()
    unitNumber!: string;

    @IsString()
    @IsOptional()
    status?: string;
}

