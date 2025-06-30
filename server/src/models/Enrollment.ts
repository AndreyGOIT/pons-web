// src/models/Enrollment.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { User } from './User';
import { Course } from './Course';

@Entity()
export class Enrollment {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { eager: true })
  user!: User;

  @ManyToOne(() => Course, { eager: true })
  course!: Course;

  @Column({ default: true })
  invoiceSent!: boolean;

  @CreateDateColumn()
  invoiceSentDate!: Date;

  @Column({ default: false })
  invoicePaid!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  userPaymentMarkedAt!: Date;

  @Column({ default: false })
  paymentConfirmedByAdmin!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  adminConfirmedAt!: Date;
}