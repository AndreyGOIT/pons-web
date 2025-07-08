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

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
invoiceAmount!: number;

@Column({ type: 'varchar', length: 34, nullable: true })
paymentIban!: string;

@Column({ type: 'varchar', length: 255, nullable: true })
paymentReference!: string;

@Column({ type: 'datetime', nullable: true })
invoiceDueDate!: Date;

  @Column({ default: false })
  invoicePaid!: boolean;

  @Column({ type: 'datetime', nullable: true })
  userPaymentMarkedAt!: Date;

  @Column({ default: false })
  paymentConfirmedByAdmin!: boolean;

  @Column({ type: 'datetime', nullable: true })
  adminConfirmedAt!: Date;
}