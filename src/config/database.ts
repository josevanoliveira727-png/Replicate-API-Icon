import { DataSource } from 'typeorm';
import { ImageGeneration } from '../entities/ImageGeneration';
import path from 'path';

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: process.env.DB_PATH || path.join(__dirname, '../../data/database.sqlite'),
  synchronize: true, // Set to false in production
  logging: process.env.NODE_ENV === 'development',
  entities: [ImageGeneration],
  migrations: [],
  subscribers: [],
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established');
  } catch (error) {
    console.error('❌ Error during Data Source initialization:', error);
    throw error;
  }
};
