import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: ['log', 'error', 'warn'],
    });

    // Enable CORS
    app.enableCors();

    await app.listen(3004);
    Logger.log('Billing Service is running on: http://localhost:3004', 'Bootstrap');
}
bootstrap();
