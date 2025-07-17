// src/models/TrialBooking.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";
import { Length, IsEmail } from "class-validator";

@Entity()
export class TrialBooking {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @Length(2, 50)
  firstName!: string;

  @Column()
  @Length(2, 50)
  lastName!: string;

  @Column()
  @IsEmail()
  email!: string;

  @Column({ nullable: true })
  phone!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
