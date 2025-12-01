import { NestFactory } from '@nestjs/core';
import { MigrationModule } from '../database/migration.module';
import { MigrationService } from '../database/migration.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(MigrationModule, {
        logger: ['error', 'warn', 'log'],
    });

    const migrationService = app.get(MigrationService);
    const command = process.argv[2];
    const arg = process.argv[3];

    try {
        switch (command) {
            case 'up':
                await migrationService.runPendingMigrations();
                break;

            case 'down':
                const steps = parseInt(arg) || 1;
                await migrationService.rollback(steps);
                break;

            case 'status':
                const status = await migrationService.getStatus();
                console.log('\n📋 Migration Status:');
                console.log('\n✅ Executed:');
                if (status.executed.length > 0) {
                    status.executed.forEach((name) => console.log(`  - ${name}`));
                } else {
                    console.log('  (none)');
                }
                console.log('\n⏳ Pending:');
                if (status.pending.length > 0) {
                    status.pending.forEach((name) => console.log(`  - ${name}`));
                } else {
                    console.log('  (none)');
                }
                console.log('');
                break;

            case 'create':
                if (!arg) {
                    console.error('❌ Error: Migration name required');
                    console.log('Usage: pnpm migrate:create <migration-name>');
                    process.exit(1);
                }
                await migrationService.createMigration(arg);
                break;

            case 'reset':
                console.log('⚠️  WARNING: This will rollback and re-run ALL migrations!');
                console.log('This should only be used in development.');
                await migrationService.reset();
                break;

            default:
                console.error('❌ Unknown command:', command);
                console.log('\nAvailable commands:');
                console.log('  up              - Run pending migrations');
                console.log('  down [N]        - Rollback N migrations (default: 1)');
                console.log('  status          - Show migration status');
                console.log('  create <name>   - Create a new migration file');
                console.log('  reset           - Rollback and re-run all (dev only)');
                process.exit(1);
        }

        await app.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration command failed:', error);
        await app.close();
        process.exit(1);
    }
}

bootstrap();
