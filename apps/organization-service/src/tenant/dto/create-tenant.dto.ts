import { IsString, IsEmail, IsOptional, ValidateIf, IsDefined } from 'class-validator';

export class CreateTenantDto {
    @IsString()
    name!: string;

    @IsOptional()
    @IsEmail()
    contactEmail?: string;

    @IsOptional()
    @IsString()
    contactPhone?: string;

    /**
     * Virtual property for contact validation.
     * Requires at least one contact method (email or phone) to be provided.
     */
    @ValidateIf((o) => !o.contactEmail && !o.contactPhone)
    @IsDefined({ message: 'At least one of contactEmail or contactPhone must be provided' })
    private readonly _requireAtLeastOneContact?: never;

    @IsOptional()
    @IsString()
    addressLine1?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    state?: string;

    @IsOptional()
    @IsString()
    zip?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    region?: string;
}
