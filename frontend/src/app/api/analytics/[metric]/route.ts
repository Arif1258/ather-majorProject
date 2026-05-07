import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongoose';
import { MonitoringLog } from '@/models/MonitoringLog';
import { Website } from '@/models/Website';
import { getCachedData, setCachedData } from '@/lib/cache';
import { withApiHandler } from '@/lib/apiHandler';

export const runtime = 'nodejs';
export const revalidate = 0; // Disable static caching

export const GET = withApiHandler(async (request: Request, { params }: { params: Promise<{ metric: string }> }) => {
  await dbConnect();
  
  const { metric } = await params;
  
  // Parse query params
  const { searchParams } = new URL(request.url);
  const websiteId = searchParams.get('websiteId') || 'all';
  const timeRange = searchParams.get('timeRange') || '1h'; // 1h, 24h, 7d

  // Cache key generation
  const cacheKey = `analytics:${metric}:${websiteId}:${timeRange}`;
  
  // Try Cache
  const cachedResponse = await getCachedData<any>(cacheKey);
  if (cachedResponse) {
    return NextResponse.json(cachedResponse, {
      headers: { 'X-Cache': 'HIT' }
    });
  }

  // Calculate time filter
  const now = new Date();
  const since = new Date();
  if (timeRange === '1h') since.setHours(now.getHours() - 1);
  else if (timeRange === '24h') since.setHours(now.getHours() - 24);
  else if (timeRange === '7d') since.setDate(now.getDate() - 7);
  
  const matchFilter: Record<string, unknown> = { timestamp: { $gte: since } };
  if (websiteId && websiteId !== 'all') {
    matchFilter.websiteId = new mongoose.Types.ObjectId(websiteId);
  }

  let resultData: any = null;

  if (metric === 'response-time') {
    const logs = await MonitoringLog.find(matchFilter).sort({ timestamp: 1 }).populate('websiteId', 'url name').lean();
    
    // Group by website for formatting suitable to Recharts LineChart
    const groupedData: Record<string, Record<string, unknown>> = {};
    
    logs.forEach((log: Record<string, unknown>) => {
      // Bin timestamps depending on timeRange
      const ts = new Date(log.timestamp as string | number | Date);
      let timeKey = '';
      if (timeRange === '1h') timeKey = ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      else if (timeRange === '24h') {
        ts.setMinutes(0, 0, 0); // Bin by hour
        timeKey = ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        ts.setHours(0, 0, 0, 0); // Bin by day
        timeKey = ts.toLocaleDateString();
      }

      if (!groupedData[timeKey]) groupedData[timeKey] = { time: timeKey, timestamp: ts.getTime() };
      
      const siteObj = log.websiteId as Record<string, string>;
      const siteName = siteObj?.name || siteObj?.url || log.websiteId;
      groupedData[timeKey][siteName as string] = log.responseTime;
    });

    resultData = Object.values(groupedData).sort((a: Record<string, unknown>, b: Record<string, unknown>) => (a.timestamp as number) - (b.timestamp as number));
  }
  else if (metric === 'uptime') {
    const upCount = await MonitoringLog.countDocuments({ ...matchFilter, status: 'UP' });
    const downCount = await MonitoringLog.countDocuments({ ...matchFilter, status: 'DOWN' });
    resultData = [
      { name: 'Uptime', value: upCount, fill: '#4ade80' },
      { name: 'Downtime', value: downCount, fill: '#f87171' }
    ];
  }
  else if (metric === 'health') {
    const healthyFilter = { ...matchFilter, healthStatus: 'Healthy' };
    const slowFilter = { ...matchFilter, healthStatus: 'Slow' };
    const downFilter = { ...matchFilter, healthStatus: 'Down' };
    
    const [healthyCount, slowCount, downCount] = await Promise.all([
      MonitoringLog.countDocuments(healthyFilter),
      MonitoringLog.countDocuments(slowFilter),
      MonitoringLog.countDocuments(downFilter)
    ]);

    resultData = [
      { name: 'Healthy', count: healthyCount, fill: '#4ade80' },
      { name: 'Slow', count: slowCount, fill: '#fbbf24' },
      { name: 'Down', count: downCount, fill: '#f87171' }
    ];
  }
  else if (metric === 'regions') {
    // Aggregation to find average response time per region
    const pipeline = [
      { $match: matchFilter },
      { $unwind: "$regionData" },
      {
        $group: {
          _id: "$regionData.region",
          avgResponseTime: { $avg: "$regionData.responseTime" }
        }
      },
      {
        $project: {
            region: "$_id",
            avgResponseTime: { $round: ["$avgResponseTime", 0] },
            _id: 0
        }
      }
    ];
    
    const regionStats = await MonitoringLog.aggregate(pipeline);
    // Map colors
    const colorMap: Record<string, string> = { 'India': '#fbbf24', 'US': '#60a5fa', 'Europe': '#a78bfa' };
    resultData = regionStats.map(stat => ({
        ...stat,
        fill: colorMap[stat.region] || '#cbd5e1'
    }));
  }
  else if (metric === 'latency-distribution') {
    const buckets = await MonitoringLog.aggregate([
      { $match: matchFilter },
      { 
        $bucket: {
          groupBy: "$responseTime",
          boundaries: [0, 500, 1000, 2000, 5000],
          default: "5000+",
          output: { count: { $sum: 1 } }
        }
      }
    ]);
    resultData = buckets.map(b => {
        const label = b._id === 0 ? "0-500ms" : b._id === 500 ? "500-1s" : b._id === 1000 ? "1s-2s" : b._id === 2000 ? "2s-5s" : "5s+";
        return {
          range: label,
          count: b.count,
          fill: b._id === 0 ? '#4ade80' : b._id === 500 ? '#fbbf24' : '#f87171'
        };
    });
  }
  else if (metric === 'error-breakdown') {
    const q: Record<string, unknown> = {};
    if (websiteId && websiteId !== 'all') q._id = new mongoose.Types.ObjectId(websiteId);
    const sites = await Website.find(q, 'incidents').lean();
    
    const counts: Record<string, number> = {};
    sites.forEach((site: Record<string, unknown>) => {
      if (!site.incidents) return;
      const incidents = site.incidents as Array<Record<string, unknown>>;
      incidents.forEach((inc: Record<string, unknown>) => {
        if (new Date(inc.timestamp as string) >= since) {
            const msg = inc.message as string || 'Unknown Error';
            counts[msg] = (counts[msg] || 0) + 1;
        }
      });
    });
    
    const colors = ['#f87171', '#fb923c', '#fcd34d', '#f472b6', '#a78bfa'];
    resultData = Object.keys(counts).map((key, idx) => ({ name: key, count: counts[key], fill: colors[idx % colors.length] }));
  }
  else if (metric === 'failure-frequency') {
    const formatString = timeRange === '7d' ? "%Y-%m-%d" : "%H:00";
    const logs = await MonitoringLog.aggregate([
      { $match: { ...matchFilter, status: 'DOWN' } },
      {
        $group: {
          _id: { $dateToString: { format: formatString, date: "$timestamp" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    resultData = logs.map(l => ({ time: l._id, failures: l.count }));
  }
  else if (metric === 'uptime-streak') {
    const q: Record<string, unknown> = { status: 'DOWN' };
    if (websiteId && websiteId !== 'all') q.websiteId = new mongoose.Types.ObjectId(websiteId);
    
    const lastDown = await MonitoringLog.findOne(q).sort({ timestamp: -1 });
    const lastDownTime = lastDown ? new Date(lastDown.timestamp).getTime() : new Date(Date.now() - 30*24*60*60*1000).getTime();
    const hoursSince = Math.floor((Date.now() - lastDownTime) / (1000 * 60 * 60));
    resultData = { streakHours: hoursSince };
  }
  else if (metric === 'health-score-trend') {
    const formatString = timeRange === '7d' ? "%Y-%m-%d" : "%H:00";
    const stats = await MonitoringLog.aggregate([
      { $match: matchFilter },
      {
        $group: {
            _id: { $dateToString: { format: formatString, date: "$timestamp" } },
            total: { $sum: 1 },
            healthy: { $sum: { $cond: [{ $eq: ["$healthStatus", "Healthy"] }, 1, 0] } },
            slow: { $sum: { $cond: [{ $eq: ["$healthStatus", "Slow"] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    resultData = stats.map(s => {
        const score = ((s.healthy * 100) + (s.slow * 50)) / s.total;
        return { time: s._id, score: Math.round(score) };
    });
  }
  else if (metric === 'incidents') {
    const q: Record<string, unknown> = {};
    if (websiteId && websiteId !== 'all') q._id = new mongoose.Types.ObjectId(websiteId);
    
    const sites = await Website.find(q, 'name url incidents').lean();
    interface Incident {
      website: string;
      timestamp: Date | string | number;
      message: string;
      resolved: boolean;
    }
    const allIncidents: Incident[] = [];
    sites.forEach(site => {
      site.incidents.forEach((inc: Record<string, unknown>) => {
          if (new Date(inc.timestamp as string | number | Date) >= since) {
            allIncidents.push({
              website: (site.name as string) || (site.url as string),
              timestamp: inc.timestamp as string | number | Date,
              message: inc.message as string,
              resolved: inc.resolved as boolean
            });
          }
      });
    });
    allIncidents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    resultData = allIncidents;
  }
  else {
    return NextResponse.json({ error: 'Unknown metric' }, { status: 404 });
  }

  const responsePayload = { success: true, data: resultData };
  await setCachedData(cacheKey, responsePayload, 30); // 30 seconds TTL

  return NextResponse.json(responsePayload, {
    headers: { 'X-Cache': 'MISS' }
  });
});
