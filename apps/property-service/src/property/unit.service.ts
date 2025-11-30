import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Unit } from './models/unit.model';
import { CreateUnitDto } from './dto/create-unit.dto';

@Injectable()
export class UnitService {
    constructor(
        @InjectModel(Unit)
        private unitModel: typeof Unit,
    ) { }

    async create(createUnitDto: CreateUnitDto): Promise<Unit> {
        return this.unitModel.create(createUnitDto as any);
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
