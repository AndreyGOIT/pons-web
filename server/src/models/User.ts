// src/models/User.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { Course } from './Course';
import { Enrollment } from './Enrollment';
import { Length, IsEmail } from 'class-validator';

export enum UserRole {
  ADMIN = 'admin',
  TRAINER = 'trainer',
  CLIENT = 'client',
}
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  @Length(2, 50)
  firstName?: string;

  @Column({ nullable: true })
  @Length(2, 50)
  lastName?: string;

  @Column()
  @Length(2, 50)
  name!: string;

  @Column({ unique: true })
  @IsEmail()
  email!: string;

  @Column()
  password!: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: UserRole.CLIENT,
  })
  role!: UserRole;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.user, {
    cascade: true,
  })
  enrollments!: Enrollment[];

  // Courses where the user is a trainer
  @ManyToMany(() => Course, course => course.trainers)
  coursesAsTrainer!: Course[];
}