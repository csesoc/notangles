import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

import { EnvironmentService } from '../modules/environment/environment.service';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  private readonly CONFIGURATION: Readonly<TypeOrmModuleOptions> = {
    autoLoadEntities: true,
    database: this.configService.get<string>('TYPEORM_DATABASE', ''),
    host: this.configService.get<string>('TYPEORM_HOST', 'localhost'),
    password: this.configService.get<string>('TYPEORM_PASSWORD', ''),
    port: this.configService.get<number>('TYPEORM_PORT', 27017),
    synchronize: this.configService.get<boolean>('TYPEORM_SYNCHRONIZE', false),
    type: 'mongodb',
    username: this.configService.get<string>('TYPEORM_USERNAME', ''),
  };

  private readonly TEST_CONFIGURATION: Readonly<TypeOrmModuleOptions> = {
    autoLoadEntities: true,
    database: ':memory:',
    synchronize: true,
    type: 'sqlite',
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly environmentService: EnvironmentService,
  ) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return this.environmentService.isTest()
      ? this.TEST_CONFIGURATION
      : this.CONFIGURATION;
  }
}
