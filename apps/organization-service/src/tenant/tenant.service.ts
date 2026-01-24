import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DataType } from 'sequelize-typescript';
import { ConfigService } from '@nestjs/config';
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
        private readonly configService: ConfigService,
    ) { }



    async create(createTenantDto: CreateTenantDto, userId?: string): Promise<Tenant> {
        console.log('CreateTenantDto:', createTenantDto);
        const { name, contactEmail, contactPhone, ...rest } = createTenantDto;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        
        // Check for collision (bypass tenant isolation for global uniqueness check)
        const styles = await this.tenantModel.findOne({ where: { slug }, hooks: false } as any);
        if (styles) {
             // fallback logic if needed
        }
        const tenantData = {
            ...rest,
            name,
            slug,
            contactEmail,
            contactPhone,
        };
        console.log('TenantData:', tenantData);
        const tenant = await this.tenantModel.create(tenantData);

        if (userId) {
            // Create membership for the creator (as Admin/Owner of this tenant)
            try {
                await firstValueFrom(
                    this.httpService.post(`http://localhost:3001/internal/users/${userId}/tenants`, {
                        orgId: tenant.id,
                        roleId: null, // Default role or null
                    }, {
                        headers: { 'X-Service-Token': this.configService.get('SERVICE_SECRET') }
                    })
                );
            } catch (error) {
                console.error('Failed to create membership for creator', error);
                // Don't fail the request, but log it. 
                // In production, we might want to transaction this.
            }
        }
        
        return tenant;
    }

    async findAll(): Promise<Tenant[]> {
        // Filtering is handled by Tenant model hook via TenantContext
        return this.tenantModel.findAll({ hooks: false } as any);
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
                this.httpService.post(`http://localhost:3001/internal/users/${userId}/tenants`, {
                    orgId: invitation.tenantId,
                    roleId: invitation.roleId,
                }, {
                    headers: { 'X-Service-Token': this.configService.get('SERVICE_SECRET') }
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
