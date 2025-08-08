// src/index.ts
import express from 'express';
import dotenv from 'dotenv';
import { AppDataSource } from './data-source';
import { initializeDatabase } from './initializeData';

import adminRoutes from './routes/adminRoutes';
import trialBookingAdminRoutes from './routes/trialBookingAdminRoutes';
import contactAdminRoutes from './routes/contactAdminRoutes';

import userRoutes from './routes/userRoutes';
import courseRoutes from './routes/courseRoutes';
import enrollmentRoutes from './routes/enrollmentRoutes';
import trialRoutes from './routes/trialRoutes';
import contactRoutes from './routes/contactRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

app.use('/public', express.static('public'));
app.use(express.json());

// Админские маршруты
app.use('/api/admin', adminRoutes);
app.use('/api/admin/trial-bookings', trialBookingAdminRoutes);
app.use('/api/admin/contact', contactAdminRoutes);

// Публичные маршруты
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/trial-bookings', trialRoutes);
app.use('/api/contact', contactRoutes);

AppDataSource.initialize()
  .then(async () => {
    console.log('📦 Data Source has been initialized');
    await initializeDatabase();

    app.get('/', (req, res) => {
      res.send('API is running...');
    });

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error during Data Source initialization', err);
  });