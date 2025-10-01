// src/models/CourseSession.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index } from "typeorm";
import { Course } from "./Course";

@Entity()
export class CourseSession {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Course, { nullable: false, onDelete: "CASCADE", eager: true })
  course!: Course;

  @Column({ type: "date" })
  @Index()
  date!: string; // store as YYYY-MM-DD

  @CreateDateColumn()
  createdAt!: Date;

  // optional: scheduled weekday or session number
  @Column({ type: "tinyint", nullable: true })
  weekday?: number; // 1-7 (Mon=1)
}