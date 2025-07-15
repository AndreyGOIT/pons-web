// src/models/Course.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { CourseType } from '../enums/CourseType';

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id!: number;

  // @Column({ type: 'enum', enum: CourseType }) // Use the enum type
  @Column({ type: 'text' }) //for SQLITE
  title!: CourseType;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'decimal', default: 0 })
  price!: number;

  // Дата начала курса
  @Column({ type: 'text', nullable: true }) // Используем TEXT, потому что SQLite не имеет отдельного типа DATE
  startDate!: string; // можно использовать Date, но с SQLite проще как string (ISO формат)

  // Дата окончания курса
  @Column({ type: 'text', nullable: true })
  endDate!: string;

  @CreateDateColumn()
  createdAt!: Date;
}