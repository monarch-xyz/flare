# Deployment (Railway)

This guide covers a minimal, production-ready Railway setup.

## Services

Deploy two services from the same repo/image:

1. **API Service**
   - Command: `node dist/api/index.js`

2. **Worker Service**
   - Command: `node dist/worker/index.js`

Why two services: the worker runs BullMQ processing and scheduling. Keeping it separate avoids API load spikes affecting evaluations.

## Required Add-ons

- **PostgreSQL**
- **Redis**

## Environment Variables

Set these on both services unless noted:

- `DATABASE_URL` (from Railway Postgres)
- `REDIS_URL` (from Railway Redis)
- `ENVIO_ENDPOINT`
- `RPC_URL_1` (and any other chain RPC URLs you need)
- `WEBHOOK_SECRET` (optional but recommended)
- `WORKER_INTERVAL_SECONDS` (optional, default 30)
- `LOG_LEVEL` (optional)

## Migrations

Run DB migrations once per deployment (Railway “Release Command” or one-off run):

```
node dist/scripts/migrate.js
```

This uses the bundled `schema.sql` and is safe to run multiple times.

## Health Check

API service exposes:

```
GET /health
```

## Notes

- Rate limiting is in-memory today (per instance). If you run multiple API instances, add Redis-backed rate limits.
- Envio schema validation is enabled by default (disable with `ENVIO_VALIDATE_SCHEMA=false`).
