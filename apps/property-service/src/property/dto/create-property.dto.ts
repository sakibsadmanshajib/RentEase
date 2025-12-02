import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreatePropertyDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsString()
    @IsNotEmpty()
    tenantId!: string;

    @IsOptional()
    @IsString()
    type?: string;

    @IsOptional()
    units?: number;
}
