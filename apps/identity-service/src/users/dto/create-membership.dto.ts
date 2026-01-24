import { IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class CreateMembershipDto {
    @IsUUID()
    @IsNotEmpty()
    orgId!: string;

    @IsUUID()
    @IsOptional()
    roleId?: string;
}
