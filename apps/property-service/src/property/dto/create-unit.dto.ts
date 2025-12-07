import { IsNotEmpty, IsString, IsUUID, IsEnum, IsOptional } from 'class-validator';

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

    @IsUUID()
    @IsOptional()
    tenantId?: string;
}
