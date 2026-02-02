# 🧠 Session Summary: Flare Signal Service Design & Implementation
**Date:** 2026-02-02
**Participants:** Anton Cheng, Stark (AI)

## 📌 Key Decisions

### 1. Project Pivot: TellTide → Flare
- **Decision:** Rebuild the monitoring infrastructure from scratch as a new service named **Flare**.
- **Reasoning:** TellTide (SQD-based prototype) was too opinionated and required maintaining a separate indexing stack. Flare uses the existing **Envio Indexer** (GraphQL) as its single source of truth.

### 2. DSL Architecture: Flexible & Composable
- **Decision:** Move away from hardcoded metrics (like `net_supply_flow`) to a primitive-based tree DSL.
- **Primitives:**
    - `EventRef`: Aggregate events over a window (sum, count, etc.).
    - `StateRef`: Read entity state (Position, Market) at `current` or `window_start`.
    - `Expression`: Composable math (+, -, *, /).
    - `Condition`: Comparison (>, <, ==).
- **Benefit:** Allows complex logic like "Net supply change < 20% of start position" without specific backend coding.

### 3. Data Strategy: Stateless Snapshots
- **Decision:** Use Envio's **Time-Travel Queries** (`block: { number: ... }`) for snapshots.
- **Implementation:** Instead of storing large JSON state blobs in our DB, we resolve the `window_start` timestamp to a block height and query Envio directly for the historical state.

### 4. Infrastructure & Safety
- **Runtime:** Stick with **Node.js 22 + TypeScript + Zod** for the MVP to maximize developer velocity and ecosystem compatibility with Envio/Data-API.
- **Scaling:** Implement **BullMQ (Redis)** from day one to handle job distribution.
- **Deployment:** Multi-stage Docker builds with `dumb-init` for proper signal handling and security (non-root user).
- **Notifications:** Strict "Everything is a Webhook" architecture. Telegram/Discord will be handled via external tunnel services to keep Flare core agnostic.

## 🛠️ Implementation Progress
- [x] Initial Repo Scaffold (`/flare`)
- [x] Recursive Tree-Walker Evaluator
- [x] Envio GraphQL Client with Filter Mapping
- [x] Zod Validators for DSL
- [x] PostgreSQL Schema (Signals + Logs)
- [x] Signal CRUD API
- [x] Multi-stage Dockerfile + Compose Setup
- [x] Comprehensive Unit & Integration Tests

## 🗓️ Next Steps
1. **BullMQ Worker:** Implementation of the background polling loop.
2. **Real Data Hookup:** Connecting the evaluator to the live Envio endpoint.
3. **Monarch FE Integration:** Start planning the UI for building these complex signals.

---
*Reference this doc for any future infrastructure or design questions regarding Flare.*
