import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    Column,
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
  
    @Column({ default: false })
    invoiceSent!: boolean;
  
    @Column({ default: false })
    invoicePaid!: boolean;
  }