import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.preprocess((val) => Number(val), z.number().default(5000)),
  DATABASE_URL: z.string().url({ message: 'DATABASE_URL must be a valid PostgreSQL connection URL' }),
  JWT_SECRET: z.string().min(8, { message: 'JWT_SECRET must be at least 8 characters long' }),
  JWT_EXPIRES_IN: z.string().default('24h'),
  RATE_LIMIT_WINDOW_MS: z.preprocess((val) => Number(val), z.number().default(900000)), // 15 minutes
  RATE_LIMIT_MAX: z.preprocess((val) => Number(val), z.number().default(100)),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default('placeholder_cloud_name'),
  CLOUDINARY_API_KEY: z.string().optional().default('placeholder_api_key'),
  CLOUDINARY_API_SECRET: z.string().optional().default('placeholder_api_secret'),
});

const parsedConfig = configSchema.safeParse(process.env);

if (!parsedConfig.success) {
  console.error('❌ Invalid environment variables:');
  console.error(JSON.stringify(parsedConfig.error.format(), null, 2));
  process.exit(1);
}

export const config = parsedConfig.data;
export default config;
