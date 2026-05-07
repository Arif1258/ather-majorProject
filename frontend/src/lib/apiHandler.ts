import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './logger';
import { httpRequestDurationMicroseconds } from './metrics';

type Handler = (req: Request, ...args: any[]) => Promise<NextResponse> | NextResponse;

export function withApiHandler(handler: Handler) {
  return async (req: Request, ...args: any[]) => {
    const start = performance.now();
    const requestId = uuidv4();
    let statusCode = 200;

    try {
      const response = await handler(req, ...args);
      statusCode = response.status || 200;
      
      // Inject tracing header
      response.headers.set('x-request-id', requestId);
      
      return response;
    } catch (error: any) {
      statusCode = error.statusCode || 500;
      
      logger.error({
        err: error,
        url: req.url,
        method: req.method,
        requestId
      }, 'API Request Failed');

      const message = error.message || 'Internal Server Error';

      const errResponse = NextResponse.json(
        { success: false, error: message },
        { status: statusCode }
      );
      errResponse.headers.set('x-request-id', requestId);
      return errResponse;
    } finally {
      const durationSeconds = (performance.now() - start) / 1000;
      const url = new URL(req.url);
      
      // Record latency histogram
      httpRequestDurationMicroseconds.labels(req.method, url.pathname, statusCode.toString()).observe(durationSeconds);
      
      logger.info({
        method: req.method,
        url: url.pathname,
        status: statusCode,
        durationMs: Math.round(durationSeconds * 1000),
        requestId
      }, 'API Request Completed');
    }
  };
}
