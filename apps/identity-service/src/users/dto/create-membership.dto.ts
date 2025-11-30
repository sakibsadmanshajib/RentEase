import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateMembershipDto {
    @IsUUID()
    @IsNotEmpty()
    tenantId!: string;

    @IsUUID()
    @IsNotEmpty()
    roleId!: string;
}
