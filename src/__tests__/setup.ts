// Test setup file
import 'reflect-metadata';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.OPENAI_API_KEY = 'test-api-key';
process.env.DB_PATH = ':memory:';
