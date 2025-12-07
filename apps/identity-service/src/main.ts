import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Enable CORS for frontend
    app.enableCors({
        origin: ['http://localhost:3000'],
        credentials: true,
    });

    // Enable validation globally
    // app.useGlobalPipes(new ValidationPipe({
    //     // whitelist: true,
    //     // forbidNonWhitelisted: true,
    //     transform: true,
    // }));

    await app.listen(3001);
    Logger.log(`Identity Service is running on: ${await app.getUrl()}`, 'Bootstrap');
}
bootstrap();
