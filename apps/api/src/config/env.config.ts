import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from monorepo root or local directory
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  API_PREFIX: process.env.API_PREFIX || '/api/v1',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  DATABASE_URL: process.env.DATABASE_URL || '',
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME || 'erp_session',
  SESSION_TTL_HOURS: parseInt(process.env.SESSION_TTL_HOURS || '24', 10),
  SESSION_SECRET: process.env.SESSION_SECRET || 'dev_session_secret_change_in_production',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
} as const;
