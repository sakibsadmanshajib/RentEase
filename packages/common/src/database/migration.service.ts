import { Injectable, Logger, OnModuleInit, Inject, Optional } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { Sequelize } from 'sequelize';
import { Umzug, SequelizeStorage } from 'umzug';
import * as path from 'path';
import * as fs from 'fs';

export const MIGRATIONS_PATH = 'MIGRATIONS_PATH';

@Injectable()
export class BaseMigrationService implements OnModuleInit {
    private umzug: Umzug<Sequelize>;
    private readonly logger = new Logger(BaseMigrationService.name);

    constructor(
        protected sequelize: Sequelize,
        protected configService: ConfigService,
        protected migrationsPath?: string
    ) {
        // Default to process.cwd() + src/database/migrations
        // This assumes the app is running from its root or the monorepo root with correct cwd
        const defaultPath = path.join(process.cwd(), 'src/database/migrations/*.js');
        const finalPath = this.migrationsPath || defaultPath;

        this.umzug = new Umzug({
            migrations: {
                glob: finalPath,
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
        // Use the directory of the glob pattern
        const globPath = this.migrationsPath || path.join(process.cwd(), 'src/database/migrations/*.{js,ts}');
        const migrationsDir = path.dirname(globPath.replace('*.{js,ts}', 'placeholder')); // rough extraction

        if (!fs.existsSync(migrationsDir)) {
            fs.mkdirSync(migrationsDir, { recursive: true });
        }

        const template = `import { DataTypes } from 'sequelize';

export const up = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();
  
  // TODO: Add your migration logic here
};

export const down = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();
  
  // TODO: Add your rollback logic here
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
