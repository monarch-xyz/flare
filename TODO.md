# 📋 Flare Implementation TODO

## Phase 1: Core Engine & Data (Current)
- [x] Initial scaffold & Git repo
- [x] Core recursive `evaluateNode` engine
- [x] Initial unit tests for evaluator
- [x] **Envio Client** (`src/envio/client.ts`)
    - [x] GraphQL request logic
    - [x] Batching support (hoisting queries)
    - [x] Time-travel queries (block height support)
    - [x] Entity types: Position, Market, MorphoEvent
- [x] **Block Resolver** (`src/envio/blocks.ts`)
    - [x] Logic to convert timestamps to block heights (time-travel)
    - [x] Binary search with backwards estimation from latest block
    - [x] Support for fast chains (Arbitrum <1s blocks)
- [x] **Condition Evaluator** (`src/engine/evaluator.ts`)
    - [x] `evaluateNode()` - recursive expression evaluation
    - [x] `evaluateCondition()` - comparison of two ExpressionNodes
    - [x] `SignalEvaluator` class (`condition.ts`) - orchestrates evaluation with EnvioClient

## Phase 2: Signal Infrastructure
- [x] **PostgreSQL Schema** (`src/db/schema.sql`)
    - [x] Signals, notification logs, snapshot blocks
    - [x] Evaluation cache table
    - [x] Repository classes with CRUD operations
- [x] **Signal CRUD API** (`src/api/routes/signals.ts`)
    - [x] Zod validation for complex DSL
    - [x] PATCH /:id for partial updates
    - [x] PATCH /:id/toggle for toggling is_active
- [x] **Simulation Engine** (`src/engine/simulation.ts`)
    - [x] `simulateSignal()` - evaluate at historical timestamp
    - [x] `simulateSignalOverTime()` - backtest over time range
    - [x] `findFirstTrigger()` - binary search for first trigger

## Phase 3: Worker & Scaling
- [x] **BullMQ Setup** (`src/worker/`)
    - [x] `scheduler.ts` - repeatable job that queues active signals
    - [x] `processor.ts` - worker that evaluates signals
    - [x] `connection.ts` - shared Redis connection
- [x] **Webhook Dispatcher** (`src/worker/notifier.ts`)
    - [x] `dispatchNotification()` with timeout
    - [x] Notification logging to DB
    - [x] Cooldown enforcement
- [ ] **Smart Query Batching** (optimization)
    - [ ] Grouping multiple signals by scope to minimize Envio calls

## Phase 4: Polish & Integration
- [ ] **Monarch FE Integration**
- [ ] **Prometheus Metrics** (evaluation times, success rates)
- [ ] **Comprehensive Integration Tests**
