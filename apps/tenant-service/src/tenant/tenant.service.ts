import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Tenant } from './models/tenant.model';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Invitation } from './models/invitation.model';
import { NotFoundException, BadRequestException } from '@nestjs/common';

@Injectable()
export class TenantService {
    constructor(
        @InjectModel(Tenant)
        private tenantModel: typeof Tenant,
        @InjectModel(Invitation)
        private invitationModel: typeof Invitation,
    ) { }

    async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
        return this.tenantModel.create(createTenantDto as any);
    }

    async findAll(): Promise<Tenant[]> {
        return this.tenantModel.findAll();
    }

    async findOne(id: string): Promise<Tenant | null> {
        return this.tenantModel.findByPk(id);
    }

    async update(id: string, updateTenantDto: UpdateTenantDto): Promise<[number, Tenant[]]> {
        return this.tenantModel.update(updateTenantDto, {
            where: { id },
            returning: true,
        });
    }

    async remove(id: string): Promise<void> {
        const tenant = await this.findOne(id);
        if (tenant) {
            await tenant.destroy();
        }
    }

    async createInvitation(tenantId: string, email: string, roleId: string): Promise<Invitation> {
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

        return this.invitationModel.create({
            tenantId,
            email,
            roleId,
            token,
            expiresAt,
            status: 'pending',
        });
    }

    async acceptInvitation(token: string): Promise<Invitation> {
        const invitation = await this.invitationModel.findOne({ where: { token } });
        if (!invitation) {
            throw new NotFoundException('Invitation not found');
        }

        if (invitation.status !== 'pending') {
            throw new BadRequestException('Invitation already accepted or expired');
        }

        if (new Date() > invitation.expiresAt) {
            invitation.status = 'expired';
            await invitation.save();
            throw new BadRequestException('Invitation expired');
        }

        // TODO: Call Identity Service to create UserTenantMembership
        // For now, we just mark it as accepted.
        // In a real implementation, we would likely need the userId of the user accepting the invite.
        // If the user doesn't exist, they might need to register first.
        // This flow assumes the user is already logged in or registers as part of acceptance.

        invitation.status = 'accepted';
        await invitation.save();
        return invitation;
    }
}
