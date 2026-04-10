import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { Website } from '@/models/Website';

export const runtime = 'nodejs';
export const revalidate = 0; // Don't cache active feed

export async function GET() {
  try {
    await dbConnect();
    type WebsiteDoc = {
      _id: { toString: () => string };
      name?: string;
      url: string;
      status?: string;
      healthStatus?: string;
      warningStatus?: string;
      checks?: { responseTime: number }[];
      lastCheck?: Date;
    };
    
    const sites = await Website.find({}, '_id name url status healthStatus warningStatus checks lastCheck').lean();

    // Map to normalized frontend feed
    const feed = sites.map((s: unknown) => {
       const doc = s as WebsiteDoc;
       const recentCheck = (doc.checks && doc.checks.length > 0) ? doc.checks[doc.checks.length - 1] : null;
       const responseTime = recentCheck ? recentCheck.responseTime : 0;
       
       return {
         _id: doc._id.toString(),
         name: doc.name || doc.url,
         url: doc.url,
         status: doc.status || 'DOWN',
         healthStatus: doc.healthStatus || 'Down',
         warningStatus: doc.warningStatus || 'Normal',
         responseTime: responseTime,
         lastCheck: doc.lastCheck
       };
    });

    return NextResponse.json({ success: true, data: feed });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch statuses' }, { status: 500 });
  }
}
