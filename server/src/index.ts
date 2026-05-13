// server/src/index.ts

import dotenv from 'dotenv';
import app from './app';
import { AppDataSource } from './data-source';
import { initializeDatabase } from './initializeData';

dotenv.config();

const PORT = Number(process.env.PORT) || 5050;

AppDataSource.initialize()
  .then(async () => {
    console.log('📦 Data Source has been initialized');
    await initializeDatabase();


      console.log("NODE_ENV:", process.env.NODE_ENV);
      console.log("DB_TYPE:", process.env.DB_TYPE);
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error during Data Source initialization', err);
  });