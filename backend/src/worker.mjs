import { Worker } from 'bullmq';
import Redis from 'ioredis';
import mongoose from 'mongoose';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import fs from 'fs';
import nodemailer from 'nodemailer';
import express from 'express';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ather_monitor';

// --- EXPRESS HEALTH PROBE ---
const app = express();
app.use(cors());
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    service: 'aether-worker',
    mongoConnection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});
const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`[Worker] Health probe HTTP server listening on port ${port}`);
});

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

WebsiteSchema.index({ status: 1 });
WebsiteSchema.index({ url: 1 });

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

MonitoringLogSchema.index({ websiteId: 1, timestamp: -1 });

const UserConfigSchema = new mongoose.Schema({
  alertEmail: { type: String, default: "" }
});

const Website = mongoose.models.Website || mongoose.model('Website', WebsiteSchema);
const SystemLog = mongoose.models.SystemLog || mongoose.model('SystemLog', SystemLogSchema);
const MonitoringLog = mongoose.models.MonitoringLog || mongoose.model('MonitoringLog', MonitoringLogSchema);
const UserConfig = mongoose.models.UserConfig || mongoose.model('UserConfig', UserConfigSchema);

// Connect DB
mongoose.connect(MONGODB_URI).then(() => {
  console.log('[Worker] Connected to MongoDB.');
}).catch(err => {
  console.error('[Worker] MongoDB Connection Error:', err.message);
});

// --- HELPERS ---
async function logSystem(message, severity = 'Info') {
  console.log(`[Worker] [${severity}] ${message}`);
  try {
    if (mongoose.connection.readyState === 1) {
      await SystemLog.create({ message, severity, source: 'worker-daemon' });
    }
  } catch(e) {}
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendEmailAlert(subject, message) {
  try {
    const config = await UserConfig.findOne({});
    if (!config || !config.alertEmail) return;

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("[Worker] EMAIL_USER or EMAIL_PASS not set in .env.");
      return;
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: config.alertEmail,
      subject: subject,
      text: message
    });
    console.log(`[Worker] Alert email sent to ${config.alertEmail}`);
  } catch (error) {
    console.error('[Worker] Failed to send email alert:', error.message);
  }
}

const getErrorMessage = (error) => {
  if (error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout'))) return 'Server too slow or overloaded';
  if (error.code === 'ENOTFOUND') return 'Domain not reachable';
  if (error.code && error.code.includes('SSL')) return 'Security certificate problem';
  return 'Request failed';
};

async function axiosWithRetry(url, options = {}, retries = 3, delayMs = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, options);
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`[Worker] Request failed for ${url}. Retrying in ${delayMs}ms (Attempt ${i + 1}/${retries})...`);
      await new Promise(res => setTimeout(res, delayMs));
    }
  }
}

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
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] });
    const page = await browser.newPage();
    
    // Memory Optimization: Block heavy resources
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

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
      
      if (width === img2.width && height === img2.height) {
        const numDiffPixels = pixelmatch(img1.data, img2.data, null, width, height, { threshold: 0.1 });
        const diffPercent = (numDiffPixels / (width * height)) * 100;
        
        fs.renameSync(newScreenshotPath, oldScreenshotPath);
        return diffPercent > 5; 
      }
    }
    
    fs.renameSync(newScreenshotPath, oldScreenshotPath);
    return false;
  } catch (err) {
    console.warn(`[Screenshot] Failed for ${url}:`, err.message);
    return false;
  }
}

// --- WORKER DEFINITION ---
const worker = new Worker('MonitorQueue', async job => {
  const { siteId, url, cycleCount } = job.data;
  const start = Date.now();
  let status = 'DOWN';
  let statusCode = 0;
  let errorMsg = null;

  try {
    const site = await Website.findById(siteId);
    if (!site) return;

    try {
      const response = await axiosWithRetry(url, { timeout: 10000 });
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
      'US': { status, latencyDiff: Math.floor(Math.random() * 40) - 20 },
      'Europe': { status, latencyDiff: Math.floor(Math.random() * 80) + 20 },
      'India': { status, latencyDiff: Math.floor(Math.random() * 150) + 100 }
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

    if (status === 'DOWN') {
        site.incidents.push({ timestamp: new Date(), message: `Website down: ${errorMsg}`, resolved: false });
        if (site.incidents.length > 5) site.incidents.shift();
    }

    if (status === 'UP' && cycleCount % 10 === 1) {
      site.visualChange = await captureAndDiffScreenshot(url, siteId);
      if (site.visualChange) {
         logSystem(`Visual UI Change detected on ${url}`, 'Warning');
      }
    }

    await site.save();

    await MonitoringLog.create({
       websiteId: site._id,
       timestamp: currentCheck.timestamp,
       responseTime: currentCheck.responseTime,
       status: currentCheck.status,
       statusCode: currentCheck.statusCode,
       healthStatus: currentCheck.healthStatus,
       regionData: currentCheck.regionData
    });

    if (prevStatus === 'UP' && status === 'DOWN') {
      const msg = `ALERT: ${url} went DOWN! Reason: ${errorMsg}`;
      logSystem(msg, 'Critical');
      await sendEmailAlert(`Website Down Alert: ${url}`, msg);
    } else if (status === 'UP' && responseTime > 3000) {
      logSystem(`ALERT: ${url} is experiencing high latency (${responseTime}ms).`, 'Warning');
    } else if (site.warningStatus !== 'Normal' && prevStatus !== 'DOWN') {
      logSystem(`NOTICE: ${url} warning status is ${site.warningStatus}.`, 'Warning');
    }

    return { url, status, responseTime };

  } catch (err) {
    logSystem(`Job Error for ${url}: ${err.message}`, 'Critical');
    throw err;
  }
}, { connection, concurrency: 5 });

worker.on('completed', job => {
  console.log(`[Worker] Job ${job.id} completed for ${job.data.url}`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job.id} failed for ${job.data.url}: ${err.message}`);
});

console.log('[Worker] BullMQ Worker started.');

// --- GRACEFUL SHUTDOWN ---
const shutdown = async (signal) => {
  console.log(`\n[Worker] Received ${signal}. Shutting down gracefully...`);
  try {
    server.close();
    console.log('[Worker] HTTP Health server closed.');
    await worker.close();
    console.log('[Worker] Stopped accepting new jobs. Active jobs finished.');
    await mongoose.disconnect();
    console.log('[Worker] MongoDB disconnected.');
    process.exit(0);
  } catch (err) {
    console.error('[Worker] Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
