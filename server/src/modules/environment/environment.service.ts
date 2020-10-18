import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

enum Environment {
  development = 'development',
  production = 'production',
  test = 'test',
}

@Injectable()
export class EnvironmentService {
  private readonly NODE_ENV = 'NODE_ENV';
  private readonly ENVIRONMENT = this.configService.get<string>(
    this.NODE_ENV,
    Environment.development,
  );

  constructor(private readonly configService: ConfigService) {}

  getEnvironment(): string {
    return this.ENVIRONMENT;
  }

  isDevelopment(): boolean {
    return this.ENVIRONMENT === Environment.development;
  }

  isTest(): boolean {
    return this.ENVIRONMENT === Environment.test;
  }

  isProduction(): boolean {
    return this.ENVIRONMENT === Environment.production;
  }
}
