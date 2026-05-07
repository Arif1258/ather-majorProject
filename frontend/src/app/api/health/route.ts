import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Redis from 'ioredis';
import { env } from '@/lib/env';
import { withApiHandler } from '@/lib/apiHandler';

async function handler() {
  const health = {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      mongodb: 'down',
      redis: 'down'
    }
  };

  // Check MongoDB
  try {
    if (mongoose.connection.readyState === 1) {
      health.services.mongodb = 'up';
    } else {
      await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
      health.services.mongodb = 'up';
    }
  } catch (error) {
    health.status = 'degraded';
    health.services.mongodb = 'down';
  }

  // Check Redis
  try {
    const redis = new Redis(env.REDIS_URL, { maxRetriesPerRequest: 1, connectTimeout: 2000 });
    const ping = await redis.ping();
    if (ping === 'PONG') {
      health.services.redis = 'up';
    }
    redis.disconnect();
  } catch (error) {
    health.status = 'degraded';
    health.services.redis = 'down';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  return NextResponse.json(health, { status: statusCode });
}

export const GET = withApiHandler(handler);
