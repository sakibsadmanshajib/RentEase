import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Tenant } from './models/tenant.model';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Invitation } from './models/invitation.model';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TenantService {
    constructor(
        @InjectModel(Tenant)
        private tenantModel: typeof Tenant,
        @InjectModel(Invitation)
        private invitationModel: typeof Invitation,
        private readonly httpService: HttpService,
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

    async suspend(id: string): Promise<Tenant> {
        const tenant = await this.findOne(id);
        if (!tenant) {
            throw new NotFoundException('Tenant not found');
        }
        tenant.subscriptionStatus = 'suspended';
        return tenant.save();
    }

    async activate(id: string): Promise<Tenant> {
        const tenant = await this.findOne(id);
        if (!tenant) {
            throw new NotFoundException('Tenant not found');
        }
        tenant.subscriptionStatus = 'active';
        return tenant.save();
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

    async acceptInvitation(token: string, userId: string): Promise<Invitation> {
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

        // Call Identity Service to create UserTenantMembership
        try {
            await firstValueFrom(
                this.httpService.post(`http://localhost:3001/users/${userId}/tenants`, {
                    tenantId: invitation.tenantId,
                    roleId: invitation.roleId,
                })
            );
        } catch (error) {
            console.error('Failed to create membership in Identity Service', error);
            throw new BadRequestException('Failed to create membership');
        }

        invitation.status = 'accepted';
        await invitation.save();
        return invitation;
    }
}
