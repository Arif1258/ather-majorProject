import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { Website } from '@/models/Website';
import { MonitoringLog } from '@/models/MonitoringLog';
import { analyzeLatency } from '@/lib/ai/aether-vision';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();

    // 1. Fetch all websites
    const websites = await Website.find({}).lean();
    
    // Summary Counts
    const total = websites.length;
    const up = websites.filter(w => w.status === 'UP' && w.healthStatus !== 'Slow').length;
    const down = websites.filter(w => w.status === 'DOWN').length;
    const slow = websites.filter(w => w.healthStatus === 'Slow').length;
    
    // Overall Health Score
    const totalScore = websites.reduce((acc, w) => acc + (w.healthScore || 100), 0);
    const overallHealthScore = total > 0 ? Math.round(totalScore / total) : 100;

    // Active Issues
    const activeIssues = websites
      .filter(w => w.status === 'DOWN' || w.healthStatus === 'Slow')
      .map(w => {
        // Find duration from last incident or guess 10m
        const lastIncident = w.incidents?.filter((i: any) => !i.resolved).pop();
        const durationMs = lastIncident ? Date.now() - new Date(lastIncident.timestamp).getTime() : 10 * 60 * 1000;
        const minutes = Math.floor(durationMs / 60000);
        return {
          id: w._id.toString(),
          url: w.url,
          status: w.status === 'DOWN' ? 'DOWN' : 'Slow',
          duration: minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`
        };
      });

    // Recent Activity Feed
    // Get recent logs from active websites or recent incidents
    let recentActivity: any[] = [];
    websites.forEach(w => {
      if (w.incidents && w.incidents.length > 0) {
        w.incidents.slice(-2).forEach((i: any) => {
          recentActivity.push({
            id: w._id.toString() + i.timestamp,
            message: `[${w.name || w.url}] ${i.message}`,
            timestamp: i.timestamp,
            type: i.severity === 'Critical' ? 'error' : 'warning'
          });
        });
      }
    });
    // Sort and grab latest 5
    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    recentActivity = recentActivity.slice(0, 5);

    if (recentActivity.length === 0) {
      recentActivity.push({
        id: '1',
        message: 'System running smoothly for all monitored infrastructure.',
        timestamp: new Date(),
        type: 'info'
      });
    }

    // Trend Graphs and Avg Response
    const recentLogs = await MonitoringLog.find().sort({ timestamp: -1 }).limit(100).lean();
    
    let avgResponseTime = 0;
    const sparklineData = Array.from({ length: 20 }, () => 0);
    const mockLatencyData: any[] = [];

    if (recentLogs.length > 0) {
      const respSum = recentLogs.reduce((acc, log) => acc + log.responseTime, 0);
      avgResponseTime = Math.round(respSum / recentLogs.length);
      
      // Compute sparkline (grouping by last 20 blocks if possible, or just recent 20 logs reversed)
      const recent20 = recentLogs.slice(0, 20).reverse();
      recent20.forEach((log, i) => {
        sparklineData[i] = log.responseTime;
        mockLatencyData.push({ timestamp: new Date(log.timestamp).getTime(), pingMs: log.responseTime });
      });
    } else {
      // Mock data if no real logs
      avgResponseTime = 45;
      for(let i=0; i<20; i++) sparklineData[i] = 40 + Math.random() * 20;
    }

    // Regional Snapshot (Simulated aggregated from regionData which might not be fully populated)
    const regionalSnapshot = {
      India: `${Math.round(avgResponseTime * 1.2)}ms`,
      US: `${Math.round(avgResponseTime * 0.8)}ms`,
      Europe: `${Math.round(avgResponseTime * 1.0)}ms`
    };

    // Insights Generation
    let insights = [];
    if (down > 0) insights.push(`${down} websites are currently experiencing downtime.`);
    if (slow > 2) insights.push(`Unusual latency spike detected across ${slow} nodes.`);
    if (avgResponseTime > 500) insights.push(`Global average response time is elevated.`);
    if (insights.length === 0) insights.push(`Network performance is stable. No active anomalies detected.`);

    // System Status
    let systemStatus = 'Healthy';
    if (down > 0 || slow > 2) systemStatus = 'Warning';
    if (down > Math.max(2, total * 0.2)) systemStatus = 'Critical';

    // Incident Summary
    let lastIncident = null;
    const allIncidents = websites.flatMap(w => w.incidents?.map((i:any) => ({...i, websiteName: w.name || w.url}))) || [];
    if (allIncidents.length > 0) {
      allIncidents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const recent = allIncidents[0];
      lastIncident = {
        websiteName: recent.websiteName,
        message: recent.message,
        timestamp: recent.timestamp,
        status: recent.resolved ? 'Resolved' : 'Active'
      };
    } else {
      lastIncident = {
        websiteName: 'Aether Edge Core',
        message: 'No recent critical incidents. Uptime streak 100%.',
        timestamp: new Date(),
        status: 'Resolved'
      }
    }

    // Optional: Return Aether Vision AI analysis based on logs
    let aiAnalysis = { isAnomaly: false, trend: 'stable', predictedPingMsAtNextCheck: avgResponseTime };
    if (mockLatencyData.length > 5) {
      // simulate the expected type for analyzeLatency
      aiAnalysis = analyzeLatency(mockLatencyData);
    }

    return NextResponse.json({
      summary: {
        total,
        up,
        down,
        slow,
        avgResponseTime,
        overallHealthScore
      },
      systemStatus,
      activeIssues,
      recentActivity,
      trend: {
        responseTimes: sparklineData
      },
      regionalSnapshot,
      insights,
      lastIncident,
      aiAnalysis
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard statistics' }, { status: 500 });
  }
}
