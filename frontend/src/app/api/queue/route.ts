import { NextResponse } from 'next/server';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { env } from '@/lib/env';
import { withApiHandler } from '@/lib/apiHandler';

async function handler() {
  const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
  const monitorQueue = new Queue('MonitorQueue', { connection });

  try {
    const counts = await monitorQueue.getJobCounts();
    
    // Disconnect safely
    await monitorQueue.close();
    connection.disconnect();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      queue: 'MonitorQueue',
      metrics: {
        active: counts.active || 0,
        waiting: counts.waiting || 0,
        completed: counts.completed || 0,
        failed: counts.failed || 0,
        delayed: counts.delayed || 0
      }
    });
  } catch (error) {
    await monitorQueue.close();
    connection.disconnect();
    throw error;
  }
}

export const GET = withApiHandler(handler);
