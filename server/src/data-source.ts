// src/data-source.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './models/User';
import { Course } from './models/Course';
import { Enrollment } from './models/Enrollment';
import { TrialBooking } from './models/TrialBooking';
import { ContactMessage } from './models/ContactMessage';
import dotenv from "dotenv";
dotenv.config();

const isProd = process.env.NODE_ENV === 'production';
const dbType = process.env.DB_TYPE || (isProd ? 'mysql' : 'sqlite');

let AppDataSource: DataSource;

if (dbType === 'sqlite') {
  AppDataSource = new DataSource({
    type: 'sqlite',
    database: process.env.DB_DATABASE || 'db.sqlite',
    synchronize: true, // удобно в dev
    logging: true,
    entities: [User, Course, Enrollment, TrialBooking, ContactMessage],
    migrations: [],
    subscribers: [],
  });
} else {
  AppDataSource = new DataSource({
    type: dbType as any, // 'mysql' или 'mariadb'
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
    synchronize: false, // в продакшне лучше использовать миграции
    logging: false,
    entities: [User, Course, Enrollment, TrialBooking, ContactMessage],
    migrations: ['dist/migration/*.js'],
  });
}

export { AppDataSource };