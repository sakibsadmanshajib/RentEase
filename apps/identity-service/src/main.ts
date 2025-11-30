import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    await app.listen(3001);
    Logger.log(`Identity Service is running on: ${await app.getUrl()}`, 'Bootstrap');
}
bootstrap();
