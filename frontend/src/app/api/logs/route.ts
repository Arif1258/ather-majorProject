import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { SystemLog } from '@/models/SystemLog';

export const runtime = 'nodejs';
export const revalidate = 0; // Disable static caching

export async function GET() {
  try {
    await dbConnect();
    const logs = await SystemLog.find().sort({ timestamp: -1 }).limit(50);
    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
