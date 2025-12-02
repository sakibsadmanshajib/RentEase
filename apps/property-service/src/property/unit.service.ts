import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Unit } from './models/unit.model';
import { CreateUnitDto } from './dto/create-unit.dto';
import { Property } from './models/property.model';

@Injectable()
export class UnitService {
    constructor(
        @InjectModel(Unit)
        private unitModel: typeof Unit,
        @InjectModel(Property)
        private propertyModel: typeof Property,
    ) { }

    async create(createUnitDto: CreateUnitDto): Promise<Unit> {
        const property = await this.propertyModel.findByPk(createUnitDto.propertyId);
        if (!property) {
            throw new NotFoundException('Property not found');
        }

        return this.unitModel.create({
            ...createUnitDto,
            tenantId: property.tenantId,
        } as any);
    }

    async findAll(propertyId: string): Promise<Unit[]> {
        return this.unitModel.findAll({ where: { propertyId } });
    }

    async findOne(id: string): Promise<Unit | null> {
        return this.unitModel.findByPk(id);
    }

    async updateStatus(id: string, status: string): Promise<Unit> {
        const unit = await this.findOne(id);
        if (!unit) {
            throw new NotFoundException('Unit not found');
        }
        unit.status = status;
        return unit.save();
    }
}
