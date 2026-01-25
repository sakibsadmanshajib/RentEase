import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    
    // Enable validation globally
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    
    const port = process.env.PORT || 3003;
    const config = new DocumentBuilder()
        .setTitle('Property Service')
        .setDescription('The Property Service API description')
        .setVersion('0.0.1')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    await app.listen(port, '0.0.0.0');
    Logger.log(`Service is running on: ${await app.getUrl()}`, 'Bootstrap');
}
bootstrap();
