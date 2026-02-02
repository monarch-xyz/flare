# 🔥 Flare

> **Complex signal monitoring for DeFi — by Monarch**

Flare lets users define sophisticated monitoring conditions on blockchain data and receive alerts when they trigger. Built on Monarch's Envio indexer infrastructure.

## Why Flare?

Current monitoring tools are limited to:
- Single events with thresholds ("alert if TVL drops below X")
- Simple state checks ("alert if utilization > 90%")

**Flare enables:**
- Multi-condition logic ("A AND B AND C")
- Group conditions ("3 of 5 addresses do X")
- Change detection ("position decreased by 10%")
- Cross-market aggregations
- Historical simulation/backtesting

## Example Signal

```json
{
  "name": "Whale Exodus Alert",
  "conditions": [
    {
      "type": "group",
      "addresses": ["0xwhale1", "0xwhale2", "0xwhale3", "0xwhale4", "0xwhale5"],
      "requirement": { "count": 3, "of": 5 },
      "condition": {
        "type": "change",
        "metric": "supply_assets",
        "direction": "decrease",
        "by": { "percent": 10 }
      }
    }
  ],
  "window": "7d",
  "webhook_url": "https://your-webhook.com/alerts"
}
```

*Triggers when 3 of 5 whale addresses reduce their supply by 10%+ within 7 days.*

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                      FLARE                          │
├─────────────────────────────────────────────────────┤
│  API          │  Engine        │  Worker           │
│  (CRUD +      │  (Condition    │  (Scheduler +     │
│   Simulate)   │   Evaluation)  │   Notifications)  │
└───────────────┴────────────────┴───────────────────┘
                        │
                        ▼
              ┌─────────────────┐
              │  Envio Indexer  │
              │  (7 chains)     │
              └─────────────────┘
```

## Quick Start

```bash
# Install
pnpm install

# Setup database
docker compose up -d
pnpm db:migrate

# Run all services
pnpm dev
```

## Documentation

| Doc | Description |
|-----|-------------|
| [DESIGN.md](./docs/DESIGN.md) | Full architecture & design decisions |
| [DSL.md](./docs/DSL.md) | Signal definition language reference |
| [API.md](./docs/API.md) | REST API documentation |
| [GETTING_STARTED.md](./docs/GETTING_STARTED.md) | Development setup guide |

## Project Status

🚧 **In Design Phase** — See [DESIGN.md](./docs/DESIGN.md) for current RFC.

## License

MIT
