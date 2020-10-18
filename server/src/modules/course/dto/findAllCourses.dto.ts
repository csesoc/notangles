import { IsNotEmpty } from 'class-validator';

export class FindAllCoursesDto {
  @IsNotEmpty()
  readonly year: number;

  @IsNotEmpty()
  readonly term: number;

  readonly code: string;
}
