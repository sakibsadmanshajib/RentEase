import { Injectable, Inject, Optional } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { Sequelize } from 'sequelize-typescript';
import { BaseMigrationService } from '@rentease/common';

export const MIGRATIONS_PATH = 'MIGRATIONS_PATH';

@Injectable()
export class MigrationService extends BaseMigrationService {
    constructor(
        @InjectConnection() sequelize: Sequelize,
        configService: ConfigService,
        @Optional() @Inject(MIGRATIONS_PATH) migrationsPath?: string
    ) {
        super(sequelize, configService as any, migrationsPath);
    }
}
