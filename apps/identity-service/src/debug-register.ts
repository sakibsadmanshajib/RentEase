
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';

async function debugRegister() {
    try {
        const app = await NestFactory.createApplicationContext(AppModule);
        const authService = app.get(AuthService);

        console.log('Got AuthService. Attempting register...');

        await authService.register({
            email: `debug-${Date.now()}@test.com`,
            password: 'Password123!',
            firstName: 'Debug',
            lastName: 'User',
            phone: '1234567890'
        });

        console.log('Register success!');
        await app.close();
    } catch (error) {
        console.error('DEBUG_SCRIPT_ERROR:', error);
        process.exit(1);
    }
}

debugRegister();
