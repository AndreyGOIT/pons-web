import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Role } from "./entities/Role";
import { Session } from "./entities/Session";
import { Product } from "./entities/Product";
import { Order } from "./entities/Order";
import { OrderItem } from "./entities/OrderItem";
import { License } from "./entities/License";

export const AppDataSource = new DataSource({
  type: "mariadb",
  host: "localhost",
  port: 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [User],  // Add this later
});