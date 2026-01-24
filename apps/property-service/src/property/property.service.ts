import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { OrganizationContext } from '@rentease/common';
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
     * Find all properties for a specific organization.
     * SECURITY: orgId is REQUIRED for data isolation.
     */
    async findAll(orgId: string): Promise<Property[]> {
        if (!orgId) {
            return [];
        }
        return this.propertyModel.findAll({ where: { orgId } });
    }

    async findOne(id: string): Promise<Property | null> {
        return this.propertyModel.findByPk(id);
    }

    /**
     * Find a property and validate it belongs to the specified organization
     */
    async findOneForOrg(id: string, orgId: string): Promise<Property> {
        if (!orgId) {
            throw new ForbiddenException('Organization context required');
        }
        const property = await this.propertyModel.findByPk(id);
        if (!property) {
            throw new NotFoundException(`Property with ID ${id} not found`);
        }
        if (property.orgId !== orgId) {
             throw new NotFoundException('Property not found');
        }
        return property;
    }

    async update(id: string, updatePropertyDto: UpdatePropertyDto, orgId: string): Promise<[number, Property[]]> {
        if (!orgId) {
            throw new ForbiddenException('Organization context required');
        }
        // Validate ownership first
        await this.findOneForOrg(id, orgId);
        // Include orgId in WHERE clause for defense in depth
        return this.propertyModel.update(updatePropertyDto, {
            where: { id, orgId },
            returning: true,
        });
    }

    async remove(id: string, orgId: string): Promise<void> {
        const property = await this.findOneForOrg(id, orgId);
        await property.destroy();
    }
}
