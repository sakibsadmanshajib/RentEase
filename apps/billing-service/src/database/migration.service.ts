import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { Sequelize } from 'sequelize';
import { Umzug, SequelizeStorage } from 'umzug';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class MigrationService implements OnModuleInit {
    private umzug: Umzug<Sequelize>;
    private readonly logger = new Logger(MigrationService.name);

    constructor(
        @InjectConnection() private sequelize: Sequelize,
        private configService: ConfigService,
    ) {
        const migrationsPath = path.join(__dirname, 'migrations/*.js');

        this.umzug = new Umzug({
            migrations: {
                glob: migrationsPath,
                resolve: ({ name, path: filepath, context }) => {
                    // eslint-disable-next-line @typescript-eslint/no-var-requires
                    const migration = require(filepath!);
                    return {
                        name,
                        up: async () => migration.up({ context }),
                        down: async () => migration.down({ context }),
                    };
                },
            },
            context: this.sequelize,
            storage: new SequelizeStorage({ sequelize: this.sequelize }),
            logger: {
                debug: (message) => this.logger.debug(message),
                info: (message) => this.logger.log(message),
                warn: (message) => this.logger.warn(message),
                error: (message) => this.logger.error(message),
            },
        });
    }

    async onModuleInit() {
        const autoMigrate = this.configService.get('AUTO_MIGRATE', 'false');
        if (autoMigrate === 'true') {
            this.logger.log('AUTO_MIGRATE enabled, running pending migrations...');
            await this.runPendingMigrations();
        } else {
            this.logger.log('AUTO_MIGRATE disabled, skipping automatic migrations');
        }
    }

    async runPendingMigrations(): Promise<void> {
        try {
            const migrations = await this.umzug.pending();
            if (migrations.length > 0) {
                this.logger.log(`Running ${migrations.length} pending migration(s)...`);
                await this.umzug.up();
                this.logger.log('✅ All migrations completed successfully');
            } else {
                this.logger.log('No pending migrations');
            }
        } catch (error) {
            this.logger.error('Migration failed:', error);
            throw error;
        }
    }

    async rollback(steps = 1): Promise<void> {
        try {
            this.logger.log(`Rolling back ${steps} migration(s)...`);
            await this.umzug.down({ step: steps });
            this.logger.log('✅ Rollback completed successfully');
        } catch (error) {
            this.logger.error('Rollback failed:', error);
            throw error;
        }
    }

    async getStatus(): Promise<{ executed: string[]; pending: string[] }> {
        const executed = await this.umzug.executed();
        const pending = await this.umzug.pending();
        return {
            executed: executed.map((m) => m.name),
            pending: pending.map((m) => m.name),
        };
    }

    async createMigration(name: string): Promise<void> {
        const timestamp = new Date()
            .toISOString()
            .replace(/[-:T]/g, '')
            .replace(/\..+/, '')
            .slice(0, 14);
        const filename = `${timestamp}-${name}.ts`;
        const migrationsDir = path.join(__dirname, 'migrations');

        if (!fs.existsSync(migrationsDir)) {
            fs.mkdirSync(migrationsDir, { recursive: true });
        }

        const template = `import { Migration } from '../types/migration.types';
import { DataTypes } from 'sequelize';

export const up: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();
  
  // TODO: Add your migration logic here
  // Example:
  // await queryInterface.createTable('table_name', {
  //   id: {
  //     type: DataTypes.UUID,
  //     defaultValue: DataTypes.UUIDV4,
  //     primaryKey: true,
  //   },
  //   createdAt: {
  //     type: DataTypes.DATE,
  //     allowNull: false,
  //   },
  //   updatedAt: {
  //     type: DataTypes.DATE,
  //     allowNull: false,
  //   },
  // });
};

export const down: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();
  
  // TODO: Add your rollback logic here
  // Example:
  // await queryInterface.dropTable('table_name');
};
`;

        const filepath = path.join(migrationsDir, filename);
        fs.writeFileSync(filepath, template);
        this.logger.log(`✅ Created migration: ${filename}`);
    }

    async reset(): Promise<void> {
        this.logger.warn('⚠️  Resetting all migrations (DANGEROUS - dev only)...');
        await this.umzug.down({ to: 0 });
        await this.umzug.up();
        this.logger.log('✅ Reset completed');
    }
}
