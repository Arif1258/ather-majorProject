import cron from 'node-cron';
import mongoose from 'mongoose';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ather_monitor';

// --- MODELS ---
const CheckResultSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  responseTime: { type: Number, required: true },
  status: { type: String, enum: ['UP', 'DOWN'], required: true },
  statusCode: { type: Number },
  healthStatus: { type: String, enum: ['Healthy', 'Slow', 'Down'], required: true },
  regionData: [
    {
      region: { type: String, required: true },
      responseTime: { type: Number, required: true },
      status: { type: String, enum: ['UP', 'DOWN'], required: true }
    }
  ]
}, { _id: false });

const WebsiteSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true },
  name: { type: String },
  lastCheck: { type: Date },
  status: { type: String, enum: ['UP', 'DOWN'] },
  warningStatus: { type: String, enum: ['Normal', 'Degrading', 'Unstable'], default: 'Normal' },
  healthStatus: { type: String, enum: ['Healthy', 'Slow', 'Down'] },
  healthScore: { type: Number, default: 100 },
  incidents: [{
    timestamp: { type: Date, default: Date.now },
    message: { type: String, required: true },
    resolved: { type: Boolean, default: false }
  }],
  visualChange: { type: Boolean, default: false },
  checks: [CheckResultSchema],
}, { timestamps: true });

const SystemLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  message: { type: String, required: true },
  severity: { type: String, enum: ['Info', 'Warning', 'Critical'], required: true },
  source: { type: String, required: true }
});

const MonitoringLogSchema = new mongoose.Schema({
  websiteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Website', required: true },
  timestamp: { type: Date, default: Date.now },
  responseTime: { type: Number, required: true },
  status: { type: String, enum: ['UP', 'DOWN'], required: true },
  statusCode: { type: Number },
  healthStatus: { type: String, enum: ['Healthy', 'Slow', 'Down'], required: true },
  regionData: [
    {
      region: { type: String, required: true },
      responseTime: { type: Number, required: true },
      status: { type: String, enum: ['UP', 'DOWN'], required: true }
    }
  ]
});

const Website = mongoose.models.Website || mongoose.model('Website', WebsiteSchema);
const SystemLog = mongoose.models.SystemLog || mongoose.model('SystemLog', SystemLogSchema);
const MonitoringLog = mongoose.models.MonitoringLog || mongoose.model('MonitoringLog', MonitoringLogSchema);

// Connect
mongoose.connect(MONGODB_URI).then(() => {
  logSystem('Connected to MongoDB.', 'Info');
}).catch(err => {
  console.error('[Cron] MongoDB Connection Error:', err.message);
});

// --- HELPERS ---
async function logSystem(message, severity = 'Info') {
  console.log(`[${severity}] ${message}`);
  try {
    if (mongoose.connection.readyState === 1) {
      await SystemLog.create({ message, severity, source: 'cron-daemon' });
    }
  } catch(e) {}
}

const getErrorMessage = (error) => {
  if (error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout'))) {
    return 'Server too slow or overloaded';
  }
  if (error.code === 'ENOTFOUND') {
    return 'Domain not reachable';
  }
  if (error.code && error.code.includes('SSL')) {
    return 'Security certificate problem';
  }
  return 'Request failed';
};

const getHealthStatus = (responseTime) => {
  if (responseTime < 1000) return 'Healthy';
  if (responseTime <= 3000) return 'Slow';
  return 'Down';
};

const calculateHealthScore = (checks) => {
  if (!checks || checks.length === 0) return 100;
  const upChecks = checks.filter(c => c.status === 'UP').length;
  const uptimeScore = (upChecks / checks.length) * 40;
  const failureRateScore = ((checks.length - upChecks) / checks.length) === 0 ? 30 : ((upChecks) / checks.length) * 30;
  const avgLatency = checks.filter(c => c.status === 'UP').reduce((acc, c) => acc + c.responseTime, 0) / (upChecks || 1);
  let latencyScore = 30;
  if (avgLatency > 3000) latencyScore = 10;
  else if (avgLatency > 1000) latencyScore = 20;
  return Math.round(uptimeScore + failureRateScore + latencyScore);
};

const getWarningStatus = (checks) => {
  if (!checks || checks.length < 2) return 'Normal';
  const last5 = checks.slice(-5);
  const failures = last5.filter(c => c.status === 'DOWN').length;
  if (failures >= 2) return 'Unstable';
  if (last5.length >= 3) {
    let degrades = true;
    for (let i = 1; i < last5.length; i++) {
        const prev = last5[i - 1].responseTime;
        const curr = last5[i].responseTime;
        if (curr <= prev || last5[i].status === 'DOWN' || last5[i-1].status === 'DOWN') { degrades = false; break; }
    }
    if (degrades) return 'Degrading';
  }
  return 'Normal';
};

// --- VISUAL DIFFING ---
const SCREENSHOT_DIR = path.resolve(__dirname, '../.screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR);

async function captureAndDiffScreenshot(url, siteId) {
  try {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
    
    const newScreenshotPath = path.join(SCREENSHOT_DIR, `${siteId}_new.png`);
    const oldScreenshotPath = path.join(SCREENSHOT_DIR, `${siteId}_old.png`);
    
    await page.screenshot({ path: newScreenshotPath });
    await browser.close();

    if (fs.existsSync(oldScreenshotPath)) {
      const img1 = PNG.sync.read(fs.readFileSync(oldScreenshotPath));
      const img2 = PNG.sync.read(fs.readFileSync(newScreenshotPath));
      const { width, height } = img1;
      
      // Ensure sizes match
      if (width === img2.width && height === img2.height) {
        const numDiffPixels = pixelmatch(img1.data, img2.data, null, width, height, { threshold: 0.1 });
        const diffPercent = (numDiffPixels / (width * height)) * 100;
        
        fs.renameSync(newScreenshotPath, oldScreenshotPath);
        return diffPercent > 5; // true if > 5% changed
      }
    }
    
    fs.renameSync(newScreenshotPath, oldScreenshotPath);
    return false;
  } catch (err) {
    console.warn(`[Screenshot] Failed for ${url}:`, err.message);
    return false;
  }
}

// Check task
let cycleCount = 0;
async function runChecks() {
  cycleCount++;
  logSystem(`Starting chron cycle #${cycleCount}`, 'Info');
  
  try {
    const websites = await Website.find();
    if (!websites.length) {
      logSystem('No websites configured.', 'Info');
      return;
    }

    for (const site of websites) {
      const start = Date.now();
      let status = 'DOWN';
      let statusCode = 0;
      let errorMsg = null;

      try {
        const response = await axios.get(site.url, { timeout: 10000 });
        status = 'UP';
        statusCode = response.status;
      } catch (error) {
         status = 'DOWN';
         statusCode = error.response ? error.response.status : 0;
         errorMsg = getErrorMessage(error);
      }

      const responseTime = status === 'UP' ? Date.now() - start : 0;
      const healthStatus = status === 'UP' ? getHealthStatus(responseTime) : 'Down';
      
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

      const prevStatus = site.status;
      
      const currentCheck = {
        timestamp: new Date(),
        responseTime,
        status,
        statusCode,
        healthStatus,
        regionData
      };

      site.checks.push(currentCheck);
      if (site.checks.length > 20) site.checks = site.checks.slice(-20);

      site.warningStatus = getWarningStatus(site.checks);
      site.healthScore = calculateHealthScore(site.checks);
      site.status = status;
      site.healthStatus = healthStatus;
      site.lastCheck = new Date();

      // Incidents logic
      if (status === 'DOWN') {
          site.incidents.push({ timestamp: new Date(), message: `Website down: ${errorMsg}`, resolved: false });
          if (site.incidents.length > 5) site.incidents.shift();
      }

      // Visual Change (Every 10th cycle to save CPU)
      if (status === 'UP' && cycleCount % 10 === 1) {
        site.visualChange = await captureAndDiffScreenshot(site.url, site._id.toString());
        if (site.visualChange) {
           logSystem(`Visual UI Change detected on ${site.url}`, 'Warning');
        }
      }

      await site.save();

      // Separate explicit log into MonitoringLog
      await MonitoringLog.create({
         websiteId: site._id,
         timestamp: currentCheck.timestamp,
         responseTime: currentCheck.responseTime,
         status: currentCheck.status,
         statusCode: currentCheck.statusCode,
         healthStatus: currentCheck.healthStatus,
         regionData: currentCheck.regionData
      });

      // Alerting System Logging
      if (prevStatus === 'UP' && status === 'DOWN') {
        logSystem(`ALERT: ${site.url} went DOWN! Reason: ${errorMsg}`, 'Critical');
      } else if (status === 'UP' && responseTime > 3000) {
        logSystem(`ALERT: ${site.url} is experiencing high latency (${responseTime}ms).`, 'Warning');
      } else if (site.warningStatus !== 'Normal' && prevStatus !== 'DOWN') {
        logSystem(`NOTICE: ${site.url} warning status is ${site.warningStatus}.`, 'Warning');
      } else {
        logSystem(`Checked ${site.url} | Status: ${status} | Latency: ${responseTime}ms`, 'Info');
      }
    }

  } catch (err) {
    logSystem(`Error running checks: ${err.message}`, 'Critical');
  }
}

// Every minute
cron.schedule('* * * * *', () => runChecks());

console.log('[Cron] Background monitoring daemon started with Puppeteer (runs every minute).');
