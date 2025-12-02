import { NestFactory } from '@nestjs/core';
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
    await app.listen(port);
    Logger.log(`Service is running on: ${await app.getUrl()}`, 'Bootstrap');
}
bootstrap();
