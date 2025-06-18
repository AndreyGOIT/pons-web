// 📁 src/entities/User.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { Role } from "./Role";
import { Session } from "./Session";
import { Order } from "./Order";
import { License } from "./License";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  phoneNumber!: string;

  @Column()
  passwordHash!: string;

  @ManyToOne(() => Role, (role) => role.users)
  role!: Role;

  @OneToMany(() => Session, (session) => session.user)
  sessions!: Session[];

  @OneToMany(() => Order, (order) => order.user)
  orders!: Order[];

  @OneToMany(() => License, (license) => license.user)
  licenses!: License[];
}