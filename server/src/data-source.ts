// src/data-source.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './models/User';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'db.sqlite', // создается автоматически
  synchronize: true,
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
});