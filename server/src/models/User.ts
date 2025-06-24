// src/models/User.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
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

  @Column()
  @Length(2, 50)
  name!: string;

  @Column({ unique: true })
  @IsEmail()
  email!: string;

  @Column()
  password!: string;

  @Column({
    type: 'text',
    default: UserRole.CLIENT,
  })
  role!: UserRole;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}