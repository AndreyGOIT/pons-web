// server/src/app.ts

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import adminRoutes from './routes/adminRoutes';
import trialBookingAdminRoutes from './routes/trialBookingAdminRoutes';
import contactAdminRoutes from './routes/contactAdminRoutes';

import userRoutes from './routes/userRoutes';
import courseRoutes from './routes/courseRoutes';
import enrollmentRoutes from './routes/enrollmentRoutes';
import trialRoutes from './routes/trialRoutes';
import contactRoutes from './routes/contactRoutes';
import trainerRoutes from './routes/trainerRoutes';
import membershipRoutes from "./routes/membershipRoutes";
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app = express();

// ----------------- Middleware -----------------
app.use('/public', express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
} else {
  app.use(cors({
    origin: ["https://pons.fi", "https://api.pons.fi"],
    credentials: true,
  }));
}
// ------------- Routes ----------------

// ---- admin routes ----
app.use('/api/admin', adminRoutes);
app.use('/api/admin/trial-bookings', trialBookingAdminRoutes);
app.use('/api/admin/contact', contactAdminRoutes);

// ---- user routes ----
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/trial-bookings', trialRoutes);
app.use('/api/contact', contactRoutes);

// ---- trainer routes ------
app.use('/api/trainer', trainerRoutes);

// ---- membership payment routes ----
app.use('/api/membership', membershipRoutes);

app.get('/', (req, res) => {
      res.send('API is running...');
    });
// ---- error middleware ------
app.use(errorHandler);

export default app;