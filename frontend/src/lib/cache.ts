import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

let redisClient: Redis | null = null;

export const getRedisClient = () => {
  if (!redisClient) {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
    });
    
    redisClient.on('error', (err) => {
      logger.error({ err }, 'Redis Cache Connection Error');
    });
  }
  return redisClient;
};

export const getCachedData = async <T>(key: string): Promise<T | null> => {
  try {
    const client = getRedisClient();
    const cached = await client.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
    return null;
  } catch (error) {
    logger.warn({ err: error, key }, 'Failed to get cached data');
    return null; // Fail open - if cache fails, just hit the DB
  }
};

export const setCachedData = async (key: string, data: any, ttlSeconds: number = 30): Promise<void> => {
  try {
    const client = getRedisClient();
    await client.setex(key, ttlSeconds, JSON.stringify(data));
  } catch (error) {
    logger.warn({ err: error, key }, 'Failed to set cache data');
  }
};
