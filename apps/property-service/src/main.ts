import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    await app.listen(3003);
    Logger.log(`Property Service is running on: ${await app.getUrl()}`, 'Bootstrap');
}
bootstrap();
