import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization') || req.headers.get('x-auth-token');
    if (!authHeader) return NextResponse.json({ error: 'No token' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    return NextResponse.json({ success: true, user: decoded });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
