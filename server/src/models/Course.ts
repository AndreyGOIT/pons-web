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

  @Column({ type: 'enum', enum: CourseType })
  title!: CourseType;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'decimal', default: 0 })
  price!: number;

  @CreateDateColumn()
  createdAt!: Date;
}