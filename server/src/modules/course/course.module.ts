import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CourseController } from './course.controller';
import { Course } from './course.model';
import { CourseService } from './course.service';

@Module({
  controllers: [CourseController],
  imports: [TypeOrmModule.forFeature([Course])],
  providers: [CourseService],
})
export class CourseModule {}
