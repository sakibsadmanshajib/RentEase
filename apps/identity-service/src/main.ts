import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    console.log('DEBUG: CWD is ' + process.cwd());

    // Enable cookie parsing for HTTP-only JWT storage
    app.use(cookieParser());

    // Enable CORS for frontend
    const corsOrigins = process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
        : ['http://localhost:3000'];

    app.enableCors({
        origin: corsOrigins,
        credentials: true,
    });

    // Enable validation globally
    // app.useGlobalPipes(new ValidationPipe({
    //     // whitelist: true,
    //     // forbidNonWhitelisted: true,
    //     transform: true,
    // }));

    await app.listen(3001, '0.0.0.0');
    Logger.log(`Identity Service is running on: ${await app.getUrl()}`, 'Bootstrap');
}
bootstrap();
