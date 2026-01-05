// src/data-source.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './models/User';
import { Course } from './models/Course';
import { Enrollment } from './models/Enrollment';
import { TrialBooking } from './models/TrialBooking';
import { ContactMessage } from './models/ContactMessage';
import { Attendance } from './models/Attendance';
import { CourseSession } from './models/CourseSession';
import path from 'path';
import dotenv from "dotenv";
import {MembershipPayment} from "./models/MembershipPayment";

const envFile =
    process.env.NODE_ENV === "production"
        ? ".env"
        : ".env.development";

dotenv.config({
    path: path.resolve(__dirname, `../${envFile}`),
});

const isProd = process.env.NODE_ENV === 'production';
const dbType = process.env.DB_TYPE || (isProd ? 'mysql' : 'sqlite');
console.log(`🗄️  Using database type: ${dbType} (NODE_ENV=${process.env.NODE_ENV})`);

let AppDataSource: DataSource;

if (dbType === 'sqlite') {
  AppDataSource = new DataSource({
    type: 'sqlite',
    database: process.env.DB_DATABASE || `${__dirname}/../db.sqlite`,
    synchronize: true, // удобно в dev
    logging: true,
    entities: [User, Course, Enrollment, TrialBooking, ContactMessage, Attendance, CourseSession, MembershipPayment],
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
    synchronize: false, // в продакшне лучше использовать МИГРАЦИИ !!!
    logging: false,
    entities: [User, Course, Enrollment, TrialBooking, ContactMessage, Attendance, CourseSession, MembershipPayment],
    migrations: ['dist/migration/*.js'],
  });
}
console.log(`🗄️  Using database type: ${dbType}`);
export { AppDataSource };