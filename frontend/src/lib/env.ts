import { z } from 'zod';

const envSchema = z.object({
  MONGODB_URI: z.string().min(1),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  EMAIL_USER: z.string().email().optional(),
  EMAIL_PASS: z.string().optional(),
  REDIS_URL: z.string().url().default('redis://localhost:6379'), // Default local redis for BullMQ
});

// We parse process.env. If it fails, it throws a detailed error and stops execution immediately.
export const env = envSchema.parse(process.env);
