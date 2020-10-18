import { Controller, Get, Query } from '@nestjs/common';

import { Course } from './course.model';
import { CourseService } from './course.service';
import { FindAllCoursesDto } from './dto/findAllCourses.dto';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  async findAll(@Query() query: FindAllCoursesDto): Promise<Course[]> {
    return await this.courseService.findAll(query);
  }
}
