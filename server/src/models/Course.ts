// src/models/Course.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
  OneToMany,
  JoinTable
} from 'typeorm';
import { User } from './User';
import { CourseType } from '../enums/CourseType';
import { CourseSession } from './CourseSession';
import { Enrollment } from './Enrollment';
import { Attendance } from './Attendance';

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id!: number;

@Column({
  type: process.env.DB_TYPE === 'sqlite' ? 'text' : 'enum',
  enum: process.env.DB_TYPE === 'sqlite' ? undefined : CourseType,
})
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

  // Дата создания записи
  @CreateDateColumn()
  createdAt!: Date;

  @ManyToMany(() => User, user => user.coursesAsTrainer, { eager: true })    
  @JoinTable()
  trainers!: User[];
  
@OneToMany(() => CourseSession, (session) => session.course)
  sessions!: CourseSession[];

  @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
  enrollments!: Enrollment[];

  @OneToMany(() => Attendance, (attendance) => attendance.course)
  attendances!: Attendance[];
}