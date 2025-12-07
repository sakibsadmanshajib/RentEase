import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { Tenant } from './models/tenant.model';
import { Invitation } from './models/invitation.model';

import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [
        SequelizeModule.forFeature([Tenant, Invitation]),
        HttpModule,
        ConfigModule,
    ],
    controllers: [TenantController],
    providers: [TenantService],
})
export class TenantModule { }

