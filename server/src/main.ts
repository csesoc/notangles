import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as Sentry from '@sentry/node';

import { EnvironmentService } from './modules/environment/environment.service';
import { ServerModule } from './modules/server/server.module';

async function bootstrap() {
  const server = await NestFactory.create(ServerModule);

  server.enableCors();

  // Global validation pipeline
  //
  // forbidNonWhitelisted: If set to true validator will strip validated object of any properties that do not have any decorators
  //
  // whitelist: If set to true, validator will strip validated (returned) object of any properties that do not use any validation decorators
  server.useGlobalPipes(
    new ValidationPipe({ forbidNonWhitelisted: true, whitelist: true }),
  );

  const configService = server.get(ConfigService);
  const environmentService = server.get(EnvironmentService);

  const logger = new Logger('NotanglesServer');

  const port = configService.get<number>('SERVER_PORT', 8080);

  Sentry.init({
    debug: environmentService.isDevelopment(),
    dsn: configService.get<string>('SENTRY_DSN'),
    enabled: environmentService.isProduction(),
    environment: environmentService.getEnvironment(),
  });

  await server.listen(port);

  logger.log(`Listening on port ${port}.`);
}

bootstrap().then();
