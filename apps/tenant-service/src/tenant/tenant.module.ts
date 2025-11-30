import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { Tenant } from './models/tenant.model';
import { Invitation } from './models/invitation.model';

@Module({
    imports: [SequelizeModule.forFeature([Tenant, Invitation])],
    controllers: [TenantController],
    providers: [TenantService],
})
export class TenantModule { }
