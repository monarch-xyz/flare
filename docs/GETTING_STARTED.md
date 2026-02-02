# Getting Started with Flare

> Developer guide for setting up and contributing to Flare.

## Prerequisites

- Node.js 18+
- pnpm
- Docker & Docker Compose
- Access to Envio indexer endpoint

## Project Setup

### 1. Clone and Install

```bash
git clone https://github.com/monarch-xyz/flare.git
cd flare
pnpm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/flare

# API
API_PORT=3000
API_HOST=0.0.0.0

# Auth
API_KEY=your-secret-api-key

# Worker
WORKER_INTERVAL_SECONDS=30

# Envio
ENVIO_ENDPOINT=https://indexer.bigdevenergy.link/...

# Optional
LOG_LEVEL=info
```

### 3. Start Database

```bash
docker compose up -d
```

### 4. Run Migrations

```bash
pnpm db:migrate
```

### 5. Start Development

```bash
# All services
pnpm dev

# Or individually:
pnpm api       # REST API only
pnpm worker    # Evaluation worker only
```

---

## Project Structure

```
flare/
├── src/
│   ├── api/              # REST API (Express)
│   │   ├── routes/       # Route handlers
│   │   ├── middleware/   # Auth, validation
│   │   └── index.ts      # API entry point
│   │
│   ├── engine/           # Signal evaluation
│   │   ├── evaluator.ts  # Main evaluation logic
│   │   ├── conditions/   # Condition implementations
│   │   ├── metrics/      # Metric fetchers
│   │   └── cache.ts      # Snapshot caching
│   │
│   ├── worker/           # Background processing
│   │   ├── scheduler.ts  # Cron scheduling
│   │   └── notifier.ts   # Webhook dispatch
│   │
│   ├── db/               # Database layer
│   │   ├── schema.ts     # Schema definitions
│   │   ├── repositories/ # Data access
│   │   └── migrations/   # SQL migrations
│   │
│   ├── envio/            # Envio client
│   │   ├── client.ts     # GraphQL client
│   │   └── queries/      # Query definitions
│   │
│   ├── types/            # TypeScript types
│   │   ├── signal.ts
│   │   ├── condition.ts
│   │   └── webhook.ts
│   │
│   └── config/           # Configuration
│
├── tests/                # Test suites
│   ├── unit/
│   ├── integration/
│   └── fixtures/
│
├── docs/                 # Documentation
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

---

## Development Workflow

### Running Tests

```bash
# All tests
pnpm test

# Unit tests only
pnpm test:unit

# Integration tests
pnpm test:integration

# Watch mode
pnpm test:watch
```

### Code Quality

```bash
# Lint
pnpm lint

# Type check
pnpm typecheck

# Format
pnpm format
```

### Database Operations

```bash
# Run migrations
pnpm db:migrate

# Reset database
pnpm db:reset

# Generate migration
pnpm db:generate <name>
```

---

## Adding a New Condition Type

1. **Create condition file** in `src/engine/conditions/`:

```typescript
// src/engine/conditions/my-condition.ts
import { Condition, EvaluationContext, EvaluationResult } from '../types';

export async function evaluateMyCondition(
  condition: MyCondition,
  context: EvaluationContext
): Promise<EvaluationResult> {
  // Fetch data from Envio
  const data = await context.envio.query(...);
  
  // Evaluate condition
  const triggered = /* your logic */;
  
  return {
    triggered,
    details: {
      // Include relevant data for webhook payload
    }
  };
}
```

2. **Register in evaluator** (`src/engine/evaluator.ts`):

```typescript
import { evaluateMyCondition } from './conditions/my-condition';

// In the switch statement
case 'my_condition':
  return evaluateMyCondition(condition, context);
```

3. **Add types** (`src/types/condition.ts`):

```typescript
export interface MyCondition {
  type: 'my_condition';
  // ... condition-specific fields
}
```

4. **Update DSL documentation** (`docs/DSL.md`)

5. **Add tests** (`tests/unit/engine/conditions/my-condition.test.ts`)

---

## Adding a New Metric

1. **Add to metrics fetcher** (`src/engine/metrics/`):

```typescript
// src/engine/metrics/my-metric.ts
export async function fetchMyMetric(
  envio: EnvioClient,
  scope: Scope
): Promise<number> {
  const result = await envio.query(MY_METRIC_QUERY, {
    chainId: scope.chains[0],
    // ...
  });
  
  return result.data.someValue;
}
```

2. **Register metric** (`src/engine/metrics/index.ts`):

```typescript
export const metricFetchers: Record<MetricType, MetricFetcher> = {
  // ...existing
  my_metric: fetchMyMetric,
};
```

3. **Add to types** (`src/types/signal.ts`):

```typescript
export type MetricType =
  | 'supply_assets'
  // ...existing
  | 'my_metric';
```

4. **Update DSL documentation**

---

## Debugging

### Enable Debug Logging

```env
LOG_LEVEL=debug
```

### Inspect Envio Queries

```typescript
// In development, queries are logged
envio.query(QUERY, vars, { debug: true });
```

### Test Signal Evaluation

```bash
# Manually trigger evaluation for a signal
pnpm tsx src/scripts/evaluate-signal.ts <signal-id>
```

### Database Inspection

```bash
# Connect to PostgreSQL
docker exec -it flare-postgres psql -U postgres -d flare

# Useful queries
SELECT * FROM signals;
SELECT * FROM notification_log ORDER BY created_at DESC LIMIT 10;
```

---

## Deployment

### Docker

```bash
docker build -t flare .
docker run -p 3000:3000 --env-file .env flare
```

### Environment Variables (Production)

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
API_KEY=secure-random-key
ENVIO_ENDPOINT=https://...
```

---

## Troubleshooting

### "Cannot connect to database"

1. Ensure Docker is running: `docker ps`
2. Check PostgreSQL logs: `docker logs flare-postgres`
3. Verify DATABASE_URL in `.env`

### "Envio query failed"

1. Check ENVIO_ENDPOINT is correct
2. Verify endpoint is accessible: `curl $ENVIO_ENDPOINT`
3. Check query variables match schema

### "Webhook not delivered"

1. Check signal `is_active` is true
2. Verify `cooldown_minutes` hasn't blocked delivery
3. Check `notification_log` for errors
4. Test webhook URL is accessible

---

## Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feat/my-feature`
3. Make changes with tests
4. Run `pnpm lint && pnpm test`
5. Submit PR

See [CONTRIBUTING.md](../CONTRIBUTING.md) for full guidelines.
