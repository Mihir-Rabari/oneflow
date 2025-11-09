import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';

// Try multiple paths to find .env (handles both dev and production builds)
const possibleEnvPaths = [
  path.resolve(process.cwd(), '.env'),                    // Root when running from repo root
  path.resolve(__dirname, '../../../../.env'),            // From server/src/config when using tsx
  path.resolve(__dirname, '../../../.env'),               // From server/dist/config when compiled
];

const envPath = possibleEnvPaths.find(p => fs.existsSync(p));
if (envPath) {
  dotenv.config({ path: envPath });
  console.log(`✅ Loaded .env from: ${envPath}`);
} else {
  console.warn('⚠️  No .env file found, using environment variables');
}

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // Redis
  REDIS_URL: z.string(),
  
  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default('7d'), // Changed from 15m to 7 days
  JWT_REFRESH_EXPIRY: z.string().default('30d'), // Changed from 7d to 30 days
  
  // Server
  PORT: z.string().transform(Number).default('4000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().url(),
  
  // Email
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string().transform(Number),
  SMTP_SECURE: z.string().transform((val) => val === 'true').default('false'),
  SMTP_USER: z.string().email(),
  SMTP_PASSWORD: z.string(),
  SMTP_FROM_NAME: z.string().default('OneFlow'),
  SMTP_FROM_EMAIL: z.string().email(),
  
  // OTP
  OTP_EXPIRY_MINUTES: z.string().transform(Number).default('10'),
  OTP_LENGTH: z.string().transform(Number).default('6'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  
  // File Upload
  MAX_FILE_SIZE: z.string().transform(Number).default('10485760'),
  UPLOAD_DIR: z.string().default('./uploads'),
  
  // CORS
  CORS_ORIGIN: z.string(),
  
  // Session
  SESSION_SECRET: z.string().min(32),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Invalid environment variables:');
    console.error(error.errors);
    process.exit(1);
  }
  throw error;
}

export { env };
