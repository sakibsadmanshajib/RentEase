import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';

function findRootEnv(): string {
    let currentDir = process.cwd();
    const rootSearchLimit = 10; // Avoid infinite loops

    for (let i = 0; i < rootSearchLimit; i++) {
        const envPath = path.join(currentDir, '.env');
        if (fs.existsSync(envPath)) {
            return envPath;
        }

        const parentDir = path.dirname(currentDir);
        if (parentDir === currentDir) {
            break;
        }
        currentDir = parentDir;
    }

    // Fallback if not found (though it should be in repo root)
    console.warn('WARN: Could not find .env file in parent directories. Defaulting to local .env');
    return '.env';
}

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: findRootEnv(),
        }),
    ],
    exports: [ConfigModule],
})
export class ServiceConfigModule {}
