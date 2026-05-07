import { NextResponse } from 'next/server';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { env } from '@/lib/env';
import { registry, queueActiveGauge, queueWaitingGauge, queueFailedGauge } from '@/lib/metrics';

// We do NOT wrap this endpoint with withApiHandler because Prometheus expects 
// raw text responses, not our standard JSON formatted response.
export async function GET() {
  const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
  const monitorQueue = new Queue('MonitorQueue', { connection });

  try {
    // 1. Sync custom Queue metrics before generating the report
    const counts = await monitorQueue.getJobCounts();
    queueActiveGauge.set(counts.active || 0);
    queueWaitingGauge.set(counts.waiting || 0);
    queueFailedGauge.set(counts.failed || 0);

    // 2. Generate Prometheus text format
    const metrics = await registry.metrics();

    // 3. Cleanup connection
    await monitorQueue.close();
    connection.disconnect();

    // 4. Return as Content-Type: text/plain as required by Prometheus
    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': registry.contentType
      }
    });
  } catch (error) {
    await monitorQueue.close();
    connection.disconnect();
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
