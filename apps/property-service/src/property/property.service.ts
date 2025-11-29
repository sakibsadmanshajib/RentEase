import { Injectable } from '@nestjs/common';
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

    async findAll(): Promise<Property[]> {
        return this.propertyModel.findAll();
    }

    async findOne(id: string): Promise<Property | null> {
        return this.propertyModel.findByPk(id);
    }

    async update(id: string, updatePropertyDto: UpdatePropertyDto): Promise<[number, Property[]]> {
        return this.propertyModel.update(updatePropertyDto, {
            where: { id },
            returning: true,
        });
    }

    async remove(id: string): Promise<void> {
        const property = await this.findOne(id);
        if (property) {
            await property.destroy();
        }
    }
}
