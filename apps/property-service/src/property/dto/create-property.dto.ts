import { IsString, IsOptional, IsNotEmpty, IsNumber } from 'class-validator';

/**
 * DTO for creating a property.
 * Note: orgId is NOT accepted in requests - it is automatically injected
 * from the JWT token via Sequelize @BeforeValidate hook.
 */
export class CreatePropertyDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    type?: string;

    @IsOptional()
    @IsNumber()
    units?: number;
}

