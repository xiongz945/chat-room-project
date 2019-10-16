import logger from '../util/logger';
import dotenv from 'dotenv';
import fs from 'fs';

// Load env variables
dotenv.config({ path: '.env' });

export const ENVIRONMENT = process.env.NODE_ENV;
const prod = ENVIRONMENT === 'production'; // Anything else is treated as 'dev'

export const SESSION_SECRET: string = process.env['SESSION_SECRET'];
export const JWT_SECRET: string = process.env['JWT_SECRET'];

export const MONGODB_URI = prod
  ? process.env['MONGODB_URI']
  : process.env['MONGODB_URI_LOCAL'];

if (!SESSION_SECRET) {
  logger.error('No client secret. Set SESSION_SECRET environment variable.');
  process.exit(1);
}

if (!MONGODB_URI) {
  if (prod) {
    logger.error(
      'No mongo connection string. Set MONGODB_URI environment variable.'
    );
  } else {
    logger.error(
      'No mongo connection string. Set MONGODB_URI_LOCAL environment variable.'
    );
  }
  process.exit(1);
}
