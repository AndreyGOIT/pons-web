// src/data-source.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './models/User';
import { Course } from './models/Course';
import { Enrollment } from './models/Enrollment';
import { TrialBooking } from './models/TrialBooking';
import { ContactMessage } from './models/ContactMessage';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'db.sqlite', // создается автоматически
  synchronize: true,
  logging: false,
  entities: [User, Course, Enrollment, TrialBooking, ContactMessage],
  migrations: [],
  subscribers: [],
});