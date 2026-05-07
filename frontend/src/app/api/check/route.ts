import { NextResponse } from 'next/server';
import axios from 'axios';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongoose';
import { Website } from '@/models/Website';

// Force node runtime for axios and mongoose compatibility
export const runtime = 'nodejs';

// Helper to determine health status based on response time
const getHealthStatus = (responseTime: number): 'Healthy' | 'Slow' | 'Down' => {
  if (responseTime < 1000) return 'Healthy';
  if (responseTime <= 3000) return 'Slow';
  return 'Down';
};

interface ICheckMock {
  status: string;
  responseTime: number;
}

// Helper for trend-based warning status
const getWarningStatus = (checks: ICheckMock[]): 'Normal' | 'Degrading' | 'Unstable' => {
  if (!checks || checks.length < 2) return 'Normal';
  
  const last5 = checks.slice(-5);
  
  // Check for Unstable (2 or more failures)
  const failures = last5.filter(c => c.status === 'DOWN').length;
  if (failures >= 2) return 'Unstable';
  
  // Check for Degrading (continuously increasing response time over at least 3 checks)
  if (last5.length >= 3) {
    let degrades = true;
    for (let i = 1; i < last5.length; i++) {
        const prev = last5[i - 1].responseTime as number;
        const curr = last5[i].responseTime as number;
        if (curr <= prev || last5[i].status === 'DOWN' || last5[i-1].status === 'DOWN') {
            degrades = false;
            break;
        }
    }
    if (degrades) return 'Degrading';
  }

  return 'Normal';
};

// Helper to format error specific to node/axios issues
const getErrorMessage = (error: unknown): string => {
  const err = error as Record<string, unknown>;
  if (err.code === 'ECONNABORTED' || (err.message && typeof err.message === 'string' && err.message.includes('timeout'))) {
    return 'Server too slow or overloaded';
  }
  if (err.code === 'ENOTFOUND') {
    return 'Domain not reachable';
  }
  if (err.code && typeof err.code === 'string' && err.code.includes('SSL')) {
    return 'Security certificate problem';
  }
  return 'Request failed';
};

const calculateHealthScore = (checks: ICheckMock[]): number => {
  if (!checks || checks.length === 0) return 100;
  
  const upChecks = checks.filter(c => c.status === 'UP').length;
  const uptimeScore = (upChecks / checks.length) * 40; // 40 points for uptime
  
  const failureRateScore = ((checks.length - upChecks) / checks.length) === 0 ? 30 : ((upChecks) / checks.length) * 30; // 30 points for reliability
  
  const avgLatency = checks.filter(c => c.status === 'UP').reduce((acc, c) => acc + c.responseTime, 0) / (upChecks || 1);
  let latencyScore = 30; // 30 points for speed
  if (avgLatency > 3000) latencyScore = 10;
  else if (avgLatency > 1000) latencyScore = 20;

  return Math.round(uptimeScore + failureRateScore + latencyScore);
};

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Ensure Mongoose is connected
    try {
      await dbConnect();
    } catch (e) {
      console.error("MongoDB connection failed:", e);
      // We will still process the check statelessly if DB fails
    }

    const start = Date.now();
    let status: 'UP' | 'DOWN' = 'DOWN';
    let statusCode = 0;
    let errorMessage = '';

    try {
      const response = await axios.get(url, { timeout: 5000 });
      status = 'UP';
      statusCode = response.status;
    } catch (error: unknown) {
      status = 'DOWN';
      const err = error as Record<string, unknown>;
      statusCode = err.response ? (err.response as { status?: number }).status || 0 : 0;
      errorMessage = getErrorMessage(error);
    }

    const end = Date.now();
    const responseTime = end - start;
    const healthStatus = status === 'UP' ? getHealthStatus(responseTime) : 'Down';

    // Multi-region simulation
    const regionModifiers = {
      'US': { status: status, latencyDiff: Math.floor(Math.random() * 40) - 20 },
      'Europe': { status: status, latencyDiff: Math.floor(Math.random() * 80) + 20 },
      'India': { status: status, latencyDiff: Math.floor(Math.random() * 150) + 100 }
    };

    const regionData = Object.entries(regionModifiers).map(([region, mod]) => ({
      region,
      responseTime: status === 'UP' ? Math.max(10, responseTime + mod.latencyDiff) : 0,
      status: mod.status
    }));

    // Data structure to return and potentially save
    const currentCheck = {
      timestamp: new Date(),
      responseTime: status === 'UP' ? responseTime : 0,
      status,
      statusCode,
      healthStatus,
      regionData
    };

    let warningStatus = 'Normal';
    let healthScore = 100;
    let incidents = [];

    try {
      // Save data and calculate trends if connected to DB
      if (mongoose.connection.readyState === 1) {
        let websiteInfo = await Website.findOne({ url });
        
        if (!websiteInfo) {
          websiteInfo = new Website({ url, name: new URL(url).hostname, checks: [], incidents: [] });
        }
        
        websiteInfo.checks.push(currentCheck);
        // Keep only the last 10 checks to avoid runaway document growth
        if (websiteInfo.checks.length > 10) {
            websiteInfo.checks = websiteInfo.checks.slice(-10);
        }

        warningStatus = getWarningStatus(websiteInfo.checks);
        healthScore = calculateHealthScore(websiteInfo.checks);
        
        websiteInfo.status = status;
        websiteInfo.healthStatus = healthStatus;
        websiteInfo.healthScore = healthScore;
        websiteInfo.lastCheck = new Date();
        websiteInfo.warningStatus = warningStatus;
        
        if (status === 'DOWN') {
           websiteInfo.incidents.push({
               timestamp: new Date(),
               message: `Website was down due to ${errorMessage || 'an unknown issue'}.`,
               resolved: false
           });
           if (websiteInfo.incidents.length > 5) websiteInfo.incidents.shift();
        }

        await websiteInfo.save();
        incidents = websiteInfo.incidents;

        // Save persistent log for Analytics
        const { MonitoringLog } = await import('@/models/MonitoringLog');
        await MonitoringLog.create({
          websiteId: websiteInfo._id,
          timestamp: currentCheck.timestamp,
          responseTime: currentCheck.responseTime,
          status: currentCheck.status,
          statusCode: currentCheck.statusCode,
          healthStatus: currentCheck.healthStatus,
          regionData: currentCheck.regionData
        });

      }
    } catch (dbError) {
      console.warn("Could not save to DB. Returning stateless response.", dbError);
    }

    return NextResponse.json({
      success: true,
      data: {
        url,
        status,
        statusCode,
        responseTime,
        healthStatus,
        warningStatus,
        healthScore,
        regionData,
        incidents,
        error: errorMessage || undefined
      }
    });

  } catch (error) {
    console.error('Check API logic error:', error);
    return NextResponse.json({ error: 'Internal server error while processing request' }, { status: 500 });
  }
}
