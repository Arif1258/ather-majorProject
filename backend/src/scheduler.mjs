import cron from 'node-cron';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import { monitorQueue } from './queue.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ather_monitor';

const WebsiteSchema = new mongoose.Schema({
  url: { type: String, required: true },
});
const Website = mongoose.models.Website || mongoose.model('Website', WebsiteSchema);

mongoose.connect(MONGODB_URI).then(() => {
  console.log('[Scheduler] Connected to MongoDB.');
}).catch(err => {
  console.error('[Scheduler] MongoDB Connection Error:', err.message);
});

// --- EXPRESS HEALTH PROBE ---
const app = express();
app.use(cors());
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    service: 'aether-scheduler',
    mongoConnection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});
const port = process.env.PORT || 8081;
const server = app.listen(port, () => {
  console.log(`[Scheduler] Health probe HTTP server listening on port ${port}`);
});

let cycleCount = 0;

async function scheduleChecks() {
  cycleCount++;
  console.log(`[Scheduler] Starting chron cycle #${cycleCount}`);
  
  try {
    const websites = await Website.find({}, '_id url');
    if (!websites.length) {
      console.log('[Scheduler] No websites configured.');
      return;
    }

    // Add jobs to the queue with deterministic jobId for deduplication
    const currentMinute = Math.floor(Date.now() / 60000);
    const jobs = websites.map(site => ({
      name: 'checkWebsite',
      data: {
        siteId: site._id.toString(),
        url: site.url,
        cycleCount
      },
      opts: {
        jobId: `check-${site._id.toString()}-${currentMinute}`,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        },
        timeout: 45000 // 45 seconds max to prevent hung puppeteer tabs
      }
    }));

    await monitorQueue.addBulk(jobs);
    console.log(`[Scheduler] Added ${jobs.length} jobs to MonitorQueue.`);

  } catch (err) {
    console.error(`[Scheduler] Error scheduling checks: ${err.message}`);
  }
}

const task = cron.schedule('* * * * *', () => scheduleChecks());

console.log('[Scheduler] Background publisher started (runs every minute).');

// --- GRACEFUL SHUTDOWN ---
const shutdown = async (signal) => {
  console.log(`\n[Scheduler] Received ${signal}. Shutting down gracefully...`);
  task.stop();
  try {
    server.close();
    console.log('[Scheduler] HTTP Health server closed.');
    await mongoose.disconnect();
    console.log('[Scheduler] MongoDB disconnected.');
    process.exit(0);
  } catch (err) {
    console.error('[Scheduler] Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
