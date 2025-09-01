import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock external dependencies
jest.mock('node-fetch', () => jest.fn());
jest.mock('fs', () => ({
  existsSync: jest.fn(),
}));
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));