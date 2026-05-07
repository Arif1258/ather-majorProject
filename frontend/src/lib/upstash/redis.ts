import { Redis } from '@upstash/redis'

// Provide fallbacks to allow UI to compile without env vars
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || 'https://placeholder.upstash.io',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || 'placeholder-token',
})
