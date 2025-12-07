import { Module, DynamicModule } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({})
export class DatabaseModule {
  static forRoot(options: { models: any[] }): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        ConfigModule,
        SequelizeModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            dialect: 'postgres',
            host: configService.get('DB_HOST', 'localhost'),
            port: configService.get('DB_PORT', 5432),
            username: configService.get('DB_USERNAME', 'postgres'),
            password: configService.get('DB_PASSWORD', 'password'),
            database: configService.get('DB_DATABASE', 'rentease'),
            autoLoadModels: true,
            synchronize: false,
            models: options.models,
            logging: false,
          }),
        }),
      ],
      providers: [],
      exports: [SequelizeModule],
    };
  }
}
