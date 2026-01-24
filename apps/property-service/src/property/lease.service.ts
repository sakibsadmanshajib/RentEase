import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { OrganizationContext } from '@rentease/common';
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
     * Find all leases for a specific organization.
     * SECURITY: orgId is REQUIRED for data isolation.
     */
    async findAll(orgId: string, unitId?: string): Promise<Lease[]> {
        if (!orgId) {
            return [];
        }
        const where: any = { orgId };
        if (unitId) {
            where.unitId = unitId;
        }
        return this.leaseModel.findAll({ where });
    }

    /**
     * Find a lease and validate it belongs to the specified organization
     */
    async findOneForOrg(id: string, orgId: string): Promise<Lease> {
        if (!orgId) {
            throw new ForbiddenException('Organization context required');
        }
        const lease = await this.leaseModel.findByPk(id);
        if (!lease) {
            throw new NotFoundException('Lease not found');
        }
        if (lease.orgId !== orgId) {
            throw new ForbiddenException('Access denied to this lease');
        }
        return lease;
    }

    async findOne(id: string): Promise<Lease | null> {
        return this.leaseModel.findByPk(id);
    }

    async updateLease(id: string, updateData: any) {
        const lease = await this.leaseModel.findByPk(id);
        if (!lease) {
             throw new NotFoundException('Lease not found');
        }

        const orgId = OrganizationContext.getOrgId();
        if (orgId && lease.orgId !== orgId) {
            // This should be caught by the BeforeFind hook implicitly if we strictly use findOne, 
            // but for findByPk, explicit check is good.
             throw new NotFoundException('Lease not found');
        }
        return this.leaseModel.findByPk(id);
    }

    async activate(id: string, orgId: string): Promise<Lease> {
        const lease = await this.findOneForOrg(id, orgId);
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

    async terminate(id: string, orgId: string): Promise<Lease> {
        const lease = await this.findOneForOrg(id, orgId);
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

    async addOccupant(leaseId: string, userId: string, orgId: string): Promise<LeaseOccupant> {
        await this.findOneForOrg(leaseId, orgId);
        return this.occupantModel.create({ leaseId, userId });
    }

    async update(id: string, updateLeaseDto: any, orgId: string): Promise<Lease> {
        const lease = await this.findOneForOrg(id, orgId);
        return lease.update(updateLeaseDto);
    }

    async remove(id: string, orgId: string): Promise<void> {
        const lease = await this.findOneForOrg(id, orgId);
        await lease.destroy();
    }
}
