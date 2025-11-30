import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Lease, LeaseOccupant, Unit } from './models/all.models';
import { CreateLeaseDto } from './dto/create-lease.dto';

@Injectable()
export class LeaseService {
    constructor(
        @InjectModel(Lease)
        private leaseModel: typeof Lease,
        @InjectModel(LeaseOccupant)
        private occupantModel: typeof LeaseOccupant,
        @InjectModel(Unit)
        private unitModel: typeof Unit,
    ) { }

    async create(createLeaseDto: CreateLeaseDto): Promise<Lease> {
        return this.leaseModel.create({
            ...createLeaseDto,
            status: 'DRAFT',
        });
    }

    async findAll(unitId?: string): Promise<Lease[]> {
        const where = unitId ? { unitId } : {};
        return this.leaseModel.findAll({ where });
    }

    async findOne(id: string): Promise<Lease | null> {
        const lease = await this.leaseModel.findByPk(id);
        if (lease) {
            const occupants = await this.occupantModel.findAll({ where: { leaseId: id } });
            lease.setDataValue('occupants', occupants);
        }
        return lease;
    }

    async activate(id: string): Promise<Lease> {
        const lease = await this.findOne(id);
        if (!lease) {
            throw new NotFoundException('Lease not found');
        }
        lease.status = 'ACTIVE';
        await lease.save();

        // Update Unit status
        const unit = await this.unitModel.findByPk(lease.unitId);
        if (unit) {
            unit.status = 'OCCUPIED';
            await unit.save();
        }

        return lease;
    }

    async terminate(id: string): Promise<Lease> {
        const lease = await this.findOne(id);
        if (!lease) {
            throw new NotFoundException('Lease not found');
        }
        lease.status = 'TERMINATED';
        await lease.save();

        // Update Unit status
        const unit = await this.unitModel.findByPk(lease.unitId);
        if (unit) {
            unit.status = 'VACANT';
            await unit.save();
        }

        return lease;
    }

    async addOccupant(leaseId: string, userId: string): Promise<LeaseOccupant> {
        const lease = await this.findOne(leaseId);
        if (!lease) {
            throw new NotFoundException('Lease not found');
        }
        return this.occupantModel.create({ leaseId, userId });
    }
}
