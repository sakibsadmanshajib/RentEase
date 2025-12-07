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
     * Find all properties for a specific tenant
     */
    async findAll(tenantId?: string): Promise<Property[]> {
        if (tenantId) {
            return this.propertyModel.findAll({ where: { tenantId } });
        }
        // Backward compatibility: if no tenantId provided, return all (for API tests)
        return this.propertyModel.findAll();
    }

    async findOne(id: string): Promise<Property | null> {
        return this.propertyModel.findByPk(id);
    }

    /**
     * Find a property and validate it belongs to the specified tenant
     */
    async findOneForTenant(id: string, tenantId: string): Promise<Property> {
        const property = await this.propertyModel.findByPk(id);
        if (!property) {
            throw new NotFoundException(`Property with ID ${id} not found`);
        }
        if (property.tenantId !== tenantId) {
            throw new ForbiddenException('Access denied to this property');
        }
        return property;
    }

    async update(id: string, updatePropertyDto: UpdatePropertyDto, tenantId?: string): Promise<[number, Property[]]> {
        // If tenantId provided, validate ownership first
        if (tenantId) {
            await this.findOneForTenant(id, tenantId);
        }
        return this.propertyModel.update(updatePropertyDto, {
            where: { id },
            returning: true,
        });
    }

    async remove(id: string, tenantId?: string): Promise<void> {
        const property = tenantId 
            ? await this.findOneForTenant(id, tenantId)
            : await this.findOne(id);
        
        if (property) {
            await property.destroy();
        }
    }
}

