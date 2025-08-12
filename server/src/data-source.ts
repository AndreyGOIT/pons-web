// src/data-source.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './models/User';
import { Course } from './models/Course';
import { Enrollment } from './models/Enrollment';
import { TrialBooking } from './models/TrialBooking';
import { ContactMessage } from './models/ContactMessage';
import dotenv from "dotenv";
import fs from 'fs';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql', // или 'mariadb', если всё же используешь MariaDB
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // ssl: {
  //   rejectUnauthorized: true // важно для Azure
  // },
  ssl: { rejectUnauthorized: false }, // временно для разработки, отключает проверку сертификата
  synchronize: true, // временно для разработки
  logging: false,
  entities: [User, Course, Enrollment, TrialBooking, ContactMessage],
});
//---------SQLite вариант:----------
// export const AppDataSource = new DataSource({
//   type: 'sqlite',
//   database: 'db.sqlite', // создается автоматически
//   synchronize: true,
//   logging: false,
//   entities: [User, Course, Enrollment, TrialBooking, ContactMessage],
//   migrations: [],
//   subscribers: [],
// });