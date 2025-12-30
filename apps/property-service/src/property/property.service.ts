import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Property } from './models/property.model';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Injectable()
export class PropertyService {
    constructor(
        @InjectModel(Property)
        private propertyModel: typeof Property,
    ) { }

    async create(createPropertyDto: CreatePropertyDto): Promise<Property> {
        return this.propertyModel.create(createPropertyDto as any);
    }

    /**
     * Find all properties for a specific tenant.
     * SECURITY: tenantId is REQUIRED for data isolation.
     */
    async findAll(tenantId: string): Promise<Property[]> {
        if (!tenantId) {
            // No tenant context = no data access
            return [];
        }
        return this.propertyModel.findAll({ where: { tenantId } });
    }

    async findOne(id: string): Promise<Property | null> {
        return this.propertyModel.findByPk(id);
    }

    /**
     * Find a property and validate it belongs to the specified tenant
     */
    async findOneForTenant(id: string, tenantId: string): Promise<Property> {
        if (!tenantId) {
            throw new ForbiddenException('Tenant context required');
        }
        const property = await this.propertyModel.findByPk(id);
        if (!property) {
            throw new NotFoundException(`Property with ID ${id} not found`);
        }
        if (property.tenantId !== tenantId) {
            throw new ForbiddenException('Access denied to this property');
        }
        return property;
    }

    async update(id: string, updatePropertyDto: UpdatePropertyDto, tenantId: string): Promise<[number, Property[]]> {
        if (!tenantId) {
            throw new ForbiddenException('Tenant context required');
        }
        // Validate ownership first
        await this.findOneForTenant(id, tenantId);
        return this.propertyModel.update(updatePropertyDto, {
            where: { id },
            returning: true,
        });
    }

    async remove(id: string, tenantId?: string): Promise<void> {
        let property: Property | null;

        if (tenantId) {
            property = await this.findOneForTenant(id, tenantId);
        } else {
            property = await this.findOne(id);
        }

        if (!property) {
            throw new NotFoundException(`Property with ID ${id} not found`);
        }

        await property.destroy();
    }
}
