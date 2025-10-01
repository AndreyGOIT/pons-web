// src/models/Attendance.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, Unique, Index } from "typeorm";
import { CourseSession } from "./CourseSession";
import { Enrollment } from "./Enrollment";

@Entity()
@Unique(["enrollment", "session"])
export class Attendance {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Enrollment, { nullable: false, onDelete: "CASCADE", eager: true })
  enrollment!: Enrollment;

  @ManyToOne(() => CourseSession, { nullable: false, onDelete: "CASCADE", eager: true })
  session!: CourseSession;

  @Column({ type: "boolean", default: false })
  present!: boolean; // true = attended, false = absent

  @Column({ type: "datetime", nullable: true })
  markedAt?: Date;

  @Column({ type: "int", nullable: true })
  markedByUserId?: number; // optional: who marked (trainer/admin)

  @CreateDateColumn()
  createdAt!: Date;
}