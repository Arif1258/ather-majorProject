# AetherMonitor Deployment Guide

This guide explains how to deploy the AetherMonitor monorepo to a production environment. 

The architecture is split into two parts:
1. **Frontend (API Gateway & UI):** Deployed to Vercel (or any Edge network).
2. **Backend (Workers):** Deployed to Railway (or AWS ECS, DigitalOcean App Platform) using Docker.

---

## 1. Database & Cache Provisioning
Before deploying the application, you need persistent state stores:
1. **MongoDB Atlas:** Create a free cluster, whitelist `0.0.0.0/0` (or your specific provider IPs), and get the Connection URI.
2. **Upstash Redis:** Create a free Redis database. You will need the standard `redis://` URL for the BullMQ workers, and the `REST_URL` / `REST_TOKEN` for the Next.js API cache.

---

## 2. Deploying the Frontend (Vercel)

The frontend is a standard Next.js application, fully configured via the `vercel.json` file in the root directory.

1. Connect your GitHub repository to Vercel.
2. Ensure the Framework Preset is set to **Next.js**.
3. Vercel will automatically read the `vercel.json` file to set the Root Directory to `frontend` and the Build Command to `npm run build:frontend`.
4. Add the following Environment Variables in the Vercel dashboard:
   - `MONGODB_URI`
   - `REDIS_URL`
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
5. Click **Deploy**.

---

## 3. Deploying the Backend Workers (Railway)

The backend workers require a persistent Docker environment because they run Puppeteer (headless Chromium) and maintain long-lived TCP connections for BullMQ.

1. Connect your GitHub repository to Railway.
2. Railway will automatically detect the `railway.toml` file in the root directory.
3. This configuration will tell Railway to build the application using the custom Debian-based `docker/worker.Dockerfile` (which includes all the necessary Linux font libraries and Chromium dependencies).
4. Add the following Environment Variables in the Railway dashboard:
   - `MONGODB_URI`
   - `REDIS_URL`
   - `EMAIL_USER` (For Gmail SMTP Alerts)
   - `EMAIL_PASS` (App Password for Gmail)
5. The `railway.toml` specifies the startup command as `npm run dev:backend:worker`, which will boot both the scheduler and worker components.

---

## 4. Alternative: Deploying via Docker Compose (VPS / Self-Hosted)

If you prefer to host everything on a single VPS (like an EC2 instance or DigitalOcean Droplet), you can use the provided `docker-compose.yml` file.

1. Clone the repository to your server.
2. Create a `.env` file based on `.env.example`.
3. Run the following command to build and detach the entire infrastructure (Frontend, Workers, MongoDB, and Redis):
```bash
docker compose up -d --build
```

### Scaling Workers
If you add hundreds of websites and notice the `/api/queue` waiting count rising, you can horizontally scale the Puppeteer workers instantly:
```bash
docker compose up -d --scale worker=3
```
This will spin up 3 independent Chromium worker containers that will intelligently share the load from the Redis queue.
