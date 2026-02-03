# ⚠️ CRITICAL ISSUE: Envio Does NOT Support Time-Travel

**Discovered:** 2026-02-03
**Status:** BLOCKING

## Problem

The Envio indexer does NOT support `block: {number: X}` argument for historical queries. Our entire "change detection" feature relies on comparing current state vs past state.

```graphql
# THIS DOES NOT WORK
Market(where: {...}, block: {number: 12345678}) { ... }
```

Error: `'Market' has no argument named 'block'`

## Impact

- ❌ `ChangeCondition` (position dropped X%) - BROKEN
- ❌ `snapshot: "window_start"` - BROKEN  
- ❌ Any historical state comparison - BROKEN
- ✅ `ThresholdCondition` on current state - WORKS
- ✅ `EventRef` aggregations (sum of events in window) - WORKS

## Options

### Option 1: Direct RPC Time-Travel (Recommended Short-Term)
Use `eth_call` with block number to read contract state directly.

**Pros:** Works immediately, accurate
**Cons:** Slow (1 RPC per state query), rate limits

```typescript
// Read Morpho contract state at historical block
const result = await publicClient.readContract({
  address: MORPHO_ADDRESS,
  abi: morphoAbi,
  functionName: 'position',
  args: [marketId, user],
  blockNumber: historicalBlock,
});
```

### Option 2: Build Snapshot Storage
Periodically snapshot state to our PostgreSQL DB.

**Pros:** Fast queries, full control
**Cons:** Storage costs, sync complexity, delayed data

### Option 3: Reconstruct from Events
Calculate historical state by replaying events backwards.

**Pros:** Uses existing Envio data
**Cons:** Complex, may miss edge cases, slow for long windows

### Option 4: Simplify Feature Set
Only support current-state conditions, no historical comparisons.

**Pros:** Works now
**Cons:** Severely limits usefulness

## Decision

TBD - Need to discuss with team.

## Lessons Learned

1. **VERIFY ASSUMPTIONS** - Don't assume features exist without testing
2. **Test with real data early** - Would have caught this day 1
3. **Document data source limitations** in ARCHITECTURE.md
