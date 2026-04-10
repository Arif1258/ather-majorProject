import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { Website } from '@/models/Website';
import { MonitoringLog } from '@/models/MonitoringLog';
import axios from 'axios';

// Limit max duration
export const maxDuration = 60;
// Disable static caching
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    // Auth or header check can be placed here if protected

    const websites = await Website.find({ isPaused: { $ne: true } });
    const results = [];

    for (const site of websites) {
      const start = Date.now();
      let status: 'UP' | 'DOWN' = 'DOWN';
      let statusCode = 0;
      let errorMsg = '';
      let severity: 'Info' | 'Warning' | 'Critical' = 'Warning';

      try {
        const response = await axios.get(site.url, { timeout: 8000 });
        status = 'UP';
        statusCode = response.status;
      } catch (unknownErr: unknown) {
        status = 'DOWN';
        const err = unknownErr as { code?: string; message?: string; response?: { status?: number } };
        if (err.code === 'ECONNABORTED' || (err.message && err.message.includes('timeout'))) {
          errorMsg = 'Timeout: Server unresponsive';
          severity = 'Critical';
        } else if (err.code === 'ENOTFOUND') {
          errorMsg = 'DNS Failure: Hostname unresolved';
          severity = 'Critical';
        } else if (err.message && (err.message.includes('SSL') || err.message.includes('certificate'))) {
          errorMsg = 'SSL Handshake Failed';
          severity = 'Warning';
        } else {
           errorMsg = `HTTP Error ${err.response?.status || 'Unknown'}`;
           severity = 'Warning';
        }
        statusCode = err.response?.status || 500;
      }

      const responseTime = Date.now() - start;
      const healthStatus = status === 'DOWN' ? 'Down' : responseTime > 2000 ? 'Slow' : 'Healthy';

      // Advanced Multi-Region simulation (optional context feature)
      const simulatedRegions = [
         { region: 'US', responseTime: responseTime, status },
         { region: 'Europe', responseTime: responseTime + Math.floor(Math.random() * 50), status },
         { region: 'India', responseTime: responseTime + Math.floor(Math.random() * 150), status }
      ];

      // Insert full telemetry log
      await MonitoringLog.create({
        websiteId: site._id,
        timestamp: new Date(),
        responseTime,
        status,
        statusCode,
        healthStatus,
        regionData: simulatedRegions,
        errorType: errorMsg || undefined
      });

      // Update Website native document
      const updateData: Record<string, unknown> = {
         lastCheck: new Date(),
         status,
         healthStatus
      };

      // Incident Handling
      if (status === 'DOWN') {
         // Create new un-resolved incident if last one was resolved or none exist
         const lastIncident = site.incidents[site.incidents.length - 1];
         if (!lastIncident || lastIncident.resolved) {
            updateData.$push = {
               incidents: {
                  timestamp: new Date(),
                  message: errorMsg,
                  resolved: false,
                  severity
               }
            };
         }
      } else {
         // Resolve existing incidents
         const lastIncident = site.incidents[site.incidents.length - 1];
         if (lastIncident && !lastIncident.resolved) {
            lastIncident.resolved = true;
            updateData.incidents = site.incidents;
         }
      }

      await Website.findByIdAndUpdate(site._id, updateData);
      results.push({ url: site.url, status, responseTime, healthStatus });
    }

    return NextResponse.json({ success: true, message: `Processed ${websites.length} websites`, results });

  } catch (error) {
    console.error(`[CRON ERROR]`, error);
    return NextResponse.json({ error: 'Cron execution failed' }, { status: 500 });
  }
}
