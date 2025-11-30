import { IsNotEmpty, IsString, IsUUID, IsEnum, IsOptional } from 'class-validator';

export class CreateUnitDto {
    @IsUUID()
    @IsNotEmpty()
    propertyId!: string;

    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsOptional()
    status?: string;
}
