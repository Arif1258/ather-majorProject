import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { MonitoringLog } from '@/models/MonitoringLog';
import { Website } from '@/models/Website';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const websiteId = searchParams.get('websiteId');

    await dbConnect();

    let query = {};
    let websiteName = "All Websites";

    if (websiteId) {
      query = { websiteId };
      const site = await Website.findById(websiteId);
      if (site) websiteName = site.url;
    }

    // Fetch the latest 1000 logs (approx past 16 hours for a single site, or fewer depending on checks)
    const logs = await MonitoringLog.find(query)
      .sort({ timestamp: -1 })
      .limit(1000)
      .populate('websiteId', 'url name')
      .lean();

    if (!logs.length) {
      return new NextResponse('No data available', { status: 404 });
    }

    // Create CSV header
    const headers = ['Timestamp', 'Website URL', 'Status', 'Response Time (ms)', 'Health Status', 'Status Code'];
    
    // Create CSV rows
    const rows = logs.map((log: any) => {
      const siteUrl = log.websiteId ? log.websiteId.url : 'Unknown';
      return [
        new Date(log.timestamp).toISOString(),
        siteUrl,
        log.status,
        log.responseTime || 0,
        log.healthStatus || 'Unknown',
        log.statusCode || 0
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    // Create a response with CSV content
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="aether_monitor_export_${new Date().getTime()}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Export Error:', error);
    return new NextResponse('Failed to export CSV: ' + error.message, { status: 500 });
  }
}
