import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    console.log('DEBUG: CWD is ' + process.cwd());

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

    const config = new DocumentBuilder()
        .setTitle('Identity Service')
        .setDescription('The Identity Service API description')
        .setVersion('0.0.1')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    await app.listen(3001, '0.0.0.0');
    Logger.log(`Identity Service is running on: ${await app.getUrl()}`, 'Bootstrap');
}
bootstrap();
