// // 📁 src/models/Product.ts
// import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
// import { OrderItem } from "./OrderItem";

// @Entity()
// export class Product {
//   @PrimaryGeneratedColumn()
//   id!: number;

//   @Column()
//   name!: string;

//   @Column("decimal")
//   price!: number;

//   @OneToMany(() => OrderItem, (item) => item.product)
//   items!: OrderItem[];
// }