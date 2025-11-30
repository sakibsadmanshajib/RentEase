import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Enable JSON-only responses
    app.useGlobalPipes(new ValidationPipe({
        transform: true,
        whitelist: true,
    }));

    // Disable HTML error pages - always return JSON
    app.enableCors();

    await app.listen(3004);
    Logger.log(`Billing Service is running on: ${await app.getUrl()}`, 'Bootstrap');
}
bootstrap();
