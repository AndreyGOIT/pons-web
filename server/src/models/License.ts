// // 📁 src/models/License.ts
// import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
// import { User } from "./User";

// @Entity()
// export class License {
//   @PrimaryGeneratedColumn()
//   id!: number;

//   @Column()
//   year!: number;

//   @Column({ default: false })
//   paid!: boolean;

//   @ManyToOne(() => User, (user) => user.licenses)
//   user!: User;
// }