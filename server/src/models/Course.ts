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

  @Column({ type: 'enum', enum: CourseType }) // Use the enum type
  // @Column({ type: 'text' }) //for SQLITE
  title!: CourseType;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'decimal',precision: 10, scale: 2,  default: 0 })
  price!: number;

  // Дата начала курса
  @Column({ type: 'date', nullable: true })
  startDate!: Date;

  // Дата окончания курса
  @Column({ type: 'date', nullable: true })
  endDate!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}