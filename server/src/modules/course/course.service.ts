import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Course } from './course.model';
import { FindAllCoursesDto } from './dto/findAllCourses.dto';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async findAll(dto: FindAllCoursesDto): Promise<Course[]> {
    return await this.courseRepository.find({
      where: dto,
      order: { name: 'ASC' },
    });
  }
}
