// src/index.ts
import express from 'express';
import dotenv from 'dotenv';
import { AppDataSource } from './data-source';
import adminRoutes from './routes/adminRoutes';
import userRoutes from './routes/userRoutes';
import courseRoutes from './routes/courseRoutes';
import enrollmentRoutes from './routes/enrollmentRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

app.use(express.json());
app.use('/api/admin/users', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enroll', enrollmentRoutes);

AppDataSource.initialize()
  .then(() => {
      console.log('📦 Data Source has been initialized');
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