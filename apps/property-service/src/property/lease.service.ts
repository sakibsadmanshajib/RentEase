import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Lease } from './models/lease.model';
import { LeaseOccupant } from './models/lease-occupant.model';
import { Unit } from './models/unit.model';
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

    /**
     * Find all leases for a specific tenant.
     * SECURITY: tenantId is REQUIRED for data isolation.
     */
    async findAll(tenantId: string, unitId?: string): Promise<Lease[]> {
        if (!tenantId) {
            return [];
        }
        const where: any = { tenantId };
        if (unitId) {
            where.unitId = unitId;
        }
        return this.leaseModel.findAll({ where });
    }

    /**
     * Find a lease and validate it belongs to the specified tenant
     */
    async findOneForTenant(id: string, tenantId: string): Promise<Lease> {
        if (!tenantId) {
            throw new ForbiddenException('Tenant context required');
        }
        const lease = await this.leaseModel.findByPk(id);
        if (!lease) {
            throw new NotFoundException('Lease not found');
        }
        if (lease.tenantId !== tenantId) {
            throw new ForbiddenException('Access denied to this lease');
        }
        return lease;
    }

    async findOne(id: string): Promise<Lease | null> {
        return this.leaseModel.findByPk(id);
    }

    async activate(id: string, tenantId: string): Promise<Lease> {
        const lease = await this.findOneForTenant(id, tenantId);
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

    async terminate(id: string, tenantId: string): Promise<Lease> {
        const lease = await this.findOneForTenant(id, tenantId);
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

    async addOccupant(leaseId: string, userId: string, tenantId: string): Promise<LeaseOccupant> {
        await this.findOneForTenant(leaseId, tenantId);
        return this.occupantModel.create({ leaseId, userId });
    }

    async update(id: string, updateLeaseDto: any, tenantId: string): Promise<Lease> {
        const lease = await this.findOneForTenant(id, tenantId);
        return lease.update(updateLeaseDto);
    }

    async remove(id: string, tenantId: string): Promise<void> {
        const lease = await this.findOneForTenant(id, tenantId);
        await lease.destroy();
    }
}
