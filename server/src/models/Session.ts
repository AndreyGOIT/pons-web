// // 📁 src/models/Session.ts
// import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
// import { User } from "./User";

// @Entity()
// export class Session {
//   @PrimaryGeneratedColumn()
//   id!: number;

//   @Column()
//   type!: string; // подростковая, фитнес-бокс, спортивный бокс

//   @Column()
//   date!: Date;

//   @ManyToOne(() => User, (user) => user.sessions)
//   user!: User;
// }