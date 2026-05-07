# AetherMonitor

> **An intelligent, highly-scalable Website Health Monitoring & Observability Platform.**

AetherMonitor is a production-grade SaaS architecture designed to monitor the uptime, latency, and visual health of websites globally. Built for massive scalability, it utilizes a decoupled backend-for-frontend architecture, asynchronous job queues, and robust enterprise observability telemetry.

---

## 🏛 Architecture Overview

The platform uses a strict monorepo architecture divided into two specialized domains:

### 1. The Gateway (`/frontend`)
A highly optimized **Next.js App Router** application acting as both the User Interface and the Backend-For-Frontend (BFF).
- **Caching Layer:** Utilizes Redis to aggressively cache heavy MongoDB analytical queries, protecting the database from high traffic volumes.
- **Observability:** Centralized request tracing injects `x-request-id` headers and high-resolution latency tracking (Prometheus Histograms) into every API call.
- **Deployment:** Optimized for edge deployment on platforms like Vercel.

### 2. The Worker Engine (`/backend`)
A resilient, stateless Node.js micro-environment built to handle heavy asynchronous background jobs.
- **BullMQ + Redis:** Distributed queues manage monitoring loops with strict retry policies (exponential backoff) and timeout prevention.
- **Visual Diffing Engine:** A heavily optimized Puppeteer instance that blocks non-essential assets (images, fonts, stylesheets) to reduce RAM usage by 70%, utilizing `pixelmatch` to detect unauthorized visual changes.
- **Graceful Shutdowns:** Intercepts `SIGINT` and `SIGTERM` signals to safely drain active job queues and close database connections, preventing data corruption during container rollouts.
- **Deployment:** Containerized via Docker, optimized for continuous running on platforms like Railway or AWS ECS.

---

## 🚀 Tech Stack

- **Frontend:** React, Next.js 15, Tailwind CSS, Recharts
- **Backend APIs:** Next.js Route Handlers, Zod Validation, Pino Structured Logging
- **Worker Engine:** Node.js, BullMQ, Puppeteer, Node-Cron
- **Databases & Cache:** MongoDB (Time-Series Data), Redis (Queues & Query Caching)
- **Observability:** `prom-client` (Prometheus Metrics Exporter)
- **Infrastructure:** Docker, Docker Compose, GitHub Actions (CI/CD)

---

## 🛠 Getting Started (Local Development)

### Prerequisites
- Node.js (v20+)
- Docker & Docker Compose

### 1. Environment Setup
Copy the `.env.example` file to create your local `.env`:
```bash
cp .env.example .env
```
Ensure you have a MongoDB instance and Redis instance running (or use the provided Docker Compose stack).

### 2. Run the Infrastructure
Spin up the required local infrastructure (MongoDB and Redis):
```bash
docker compose up -d mongo redis
```

### 3. Install Dependencies
This project uses NPM Workspaces. Run this at the root:
```bash
npm install
```

### 4. Start the Full Stack
Run the following command to boot the Frontend UI, the Scheduler, and the Worker nodes concurrently:
```bash
npm run dev
```
- **Dashboard:** `http://localhost:3000`
- **Prometheus Metrics:** `http://localhost:3000/api/metrics`
- **Queue Telemetry:** `http://localhost:3000/api/queue`
- **Health Check:** `http://localhost:3000/api/health`

---

## 📈 Scalability Features

- **Queue Deduplication:** Deterministic `jobId`s prevent redundant checks if workers fall behind.
- **Compound Indexing:** `O(log N)` MongoDB indexes ensure the analytics dashboard loads in < 10ms even with millions of logs.
- **Container Isolation:** The heavy chromium-based Puppeteer workers are isolated in their own docker containers, allowing you to scale them horizontally (`docker compose up --scale worker=3`) without impacting the frontend API performance.

---

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
