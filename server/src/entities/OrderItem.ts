// 📁 src/entities/OrderItem.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Order } from "./Order";
import { Product } from "./Product";

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  quantity!: number;

  @ManyToOne(() => Product, (product) => product.items)
  product!: Product;

  @ManyToOne(() => Order, (order) => order.items)
  order!: Order;
}