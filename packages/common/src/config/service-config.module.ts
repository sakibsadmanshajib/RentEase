import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Finds the .env file, preferring local service .env over root .env
 * This allows each microservice to run independently with its own config
 */
function findEnvFile(): string[] {
    const envFiles: string[] = [];

    // 1. Check for local .env in service directory
    const localEnv = path.resolve(__dirname, '..', '.env');
    if (fs.existsSync(localEnv)) {
        envFiles.push(localEnv);
    }

    // 2. Check for .env in current working directory (when run standalone)
    const cwdEnv = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(cwdEnv) && !envFiles.includes(cwdEnv)) {
        envFiles.push(cwdEnv);
    }

    // 3. Check for root .env (monorepo development)
    const rootEnv = path.resolve(process.cwd(), '..', '..', '.env');
    if (fs.existsSync(rootEnv) && !envFiles.includes(rootEnv)) {
        envFiles.push(rootEnv);
    }

    if (envFiles.length === 0) {
        console.warn('WARN: No .env file found. Using environment variables only.');
    }

    return envFiles;
}

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: findEnvFile(),
        }),
    ],
    exports: [ConfigModule],
})
export class ServiceConfigModule {}
