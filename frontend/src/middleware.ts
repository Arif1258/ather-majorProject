import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { redis } from '@/lib/upstash/redis';

export async function middleware(request: NextRequest) {
  // Only rate limit API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Determine IP address for rate limiting
    const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? '127.0.0.1';
    
    // Fixed window of 1 minute (60000 ms)
    const window = Math.floor(Date.now() / 60000);
    const key = `ratelimit:${ip}:${window}`;
    
    try {
      const current = await redis.incr(key);
      // Set expiration on the first increment
      if (current === 1) {
        await redis.expire(key, 60);
      }
      
      // Limit to 50 requests per minute per IP
      if (current > 50) {
        return NextResponse.json(
          { 
            error: 'Too Many Requests', 
            message: 'You have exceeded the 50 requests/minute limit. Please try again later.' 
          },
          { 
            status: 429,
            headers: {
              'Retry-After': '60',
              'X-RateLimit-Limit': '50',
              'X-RateLimit-Remaining': '0',
            }
          }
        );
      }
      
      // Add rate limit headers to successful requests
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', '50');
      response.headers.set('X-RateLimit-Remaining', String(Math.max(0, 50 - current)));
      return response;
      
    } catch (error) {
      // Fail open: If Redis is unavailable or unconfigured (placeholders), 
      // do not block the user, but log the warning.
      console.warn('[Middleware] Rate limiting bypassed due to Redis error. Ensure UPSTASH_REDIS_REST_URL is configured.');
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
