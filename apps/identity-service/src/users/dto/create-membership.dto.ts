import { IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class CreateMembershipDto {
    @IsUUID()
    @IsNotEmpty()
    tenantId!: string;

    @IsUUID()
    @IsOptional()
    roleId?: string;
}
