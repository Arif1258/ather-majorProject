import client from 'prom-client';

// Initialize default node metrics
client.collectDefaultMetrics({ prefix: 'aether_' });

// Create custom latency histogram
export const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'aether_http_request_duration_seconds',
  help: 'Duration of HTTP requests in microseconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10] // Buckets in seconds
});

// Custom gauges for Queue monitoring
export const queueActiveGauge = new client.Gauge({
  name: 'aether_queue_active',
  help: 'Number of active jobs in the MonitorQueue'
});

export const queueWaitingGauge = new client.Gauge({
  name: 'aether_queue_waiting',
  help: 'Number of waiting jobs in the MonitorQueue'
});

export const queueFailedGauge = new client.Gauge({
  name: 'aether_queue_failed',
  help: 'Number of failed jobs in the MonitorQueue'
});

export const registry = client.register;
