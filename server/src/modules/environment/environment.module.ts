import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { EnvironmentService } from './environment.service';

@Module({
  exports: [EnvironmentService],
  imports: [ConfigModule],
  providers: [EnvironmentService],
})
export class EnvironmentModule {}
