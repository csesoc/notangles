import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column()
  code: string;

  @Column()
  name: string;

  @Column()
  year: number;

  @Column()
  term: number;
}
