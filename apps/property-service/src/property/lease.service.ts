import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Lease } from './models/lease.model';
import { CreateLeaseDto } from './dto/create-lease.dto';

@Injectable()
export class LeaseService {
    constructor(
        @InjectModel(Lease)
        private leaseModel: typeof Lease,
    ) { }

    create(createLeaseDto: CreateLeaseDto) {
        return this.leaseModel.create(createLeaseDto as any);
    }

    findAll() {
        return this.leaseModel.findAll();
    }

    findOne(id: string) {
        return this.leaseModel.findByPk(id);
    }

    findByTenant(tenantId: string) {
        return this.leaseModel.findAll({ where: { tenantId } });
    }
}
