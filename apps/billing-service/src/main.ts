import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    await app.listen(3004);
    console.log(`Billing Service is running on: ${await app.getUrl()}`);
}
bootstrap();
