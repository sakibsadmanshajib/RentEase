import { IsString, IsOptional } from 'class-validator';

export class UpdatePropertyDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    address?: string;
}
