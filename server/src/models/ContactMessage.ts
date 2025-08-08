import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class ContactMessage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column("text")
  message!: string;

  @Column({ nullable: true })
  adminReply!: string;

  @CreateDateColumn()
  createdAt!: Date;
}