import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Tenant } from './models/tenant.model';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantService {
    constructor(
        @InjectModel(Tenant)
        private tenantModel: typeof Tenant,
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
}
