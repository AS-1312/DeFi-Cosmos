# Envio HyperIndex Development Guide

## Project Overview
This is a **HyperIndex** (NOT TheGraph subgraph) blockchain indexer for Uniswap V4 on Ethereum mainnet. It tracks pool activity, swaps, liquidity modifications, whale transactions, and protocol metrics.

## Architecture

### Key Components
- `schema.graphql`: Entity definitions (Pool, Transaction, WhaleActivity, etc.)
- `config.yaml`: Network configuration, contract addresses, event definitions
- `src/EventHandlers.ts`: Event processing logic
- `generated/`: Auto-generated TypeScript types and database code (do not edit manually)

### Data Flow
1. Events are emitted from PoolManager contract (0x000000000004444c5dc75cB358380D2e3dE08A90)
2. Handlers in `EventHandlers.ts` process events and update entities
3. Entities are persisted via `context.EntityName.set(entity)`
4. GraphQL API serves indexed data at `localhost:8080`

## Critical Patterns (HyperIndex-Specific)

### Entity Immutability & Updates
**Entities are readonly** - you CANNOT mutate directly. Always use spread operator:

```typescript
// ❌ WRONG - Direct mutation fails
const pool = await context.Pool.get(id);
pool.liquidity = newLiquidity; // ERROR: readonly property

// ✅ CORRECT - Create new object
const updatedPool = {
  ...pool,
  liquidity: newLiquidity,
  txCount: pool.txCount + BigInt(1)
};
context.Pool.set(updatedPool);
```

### BigDecimal vs BigInt
- Volume/amount fields use `BigDecimal` (from `bignumber.js`)
- Counts/counters use native `bigint`
- Always convert to BigDecimal for amounts: `new BigDecimal(amount.toString())`
- Use BigDecimal methods: `.plus()`, `.minus()`, `.isGreaterThan()`

```typescript
// ❌ WRONG
totalVolume: BigInt(0)  // Type error for volume fields

// ✅ CORRECT
totalVolume: new BigDecimal(0)
volumeETH: pool.volumeETH.plus(new BigDecimal(amount.toString()))
```

### Async Entity Access
ALL entity reads return Promises - always `await`:

```typescript
// ❌ WRONG
const pool = context.Pool.get(id);
pool.liquidity  // Error: Property doesn't exist on Promise

// ✅ CORRECT
const pool = await context.Pool.get(id);
if (!pool) return;  // Handle not found
```

### Transaction Field Selection
To access `event.transaction.*` fields, explicitly declare them in `config.yaml`:

```yaml
events:
  - event: Swap(...)
    field_selection:
      transaction_fields:
        - transactionHash
        - gasPrice
```

Then access as: `event.transaction.transactionHash`, NOT `event.transaction.hash`

### Relationships
Use `entity_id` fields (string), not direct entity references:

```typescript
// ❌ WRONG - No entity arrays or direct references
pool: pool  // Not supported
users: [User!]!  // Arrays not supported

// ✅ CORRECT - Use ID fields
pool_id: id  // Foreign key as string
```

## Development Workflow

### Essential Commands
```bash
pnpm codegen          # Regenerate types after schema/config changes
pnpm tsc --noEmit     # Type-check without compiling
TUI_OFF=true pnpm dev # Run indexer (catches runtime errors)
```

**ALWAYS run after changes:**
1. `schema.graphql` or `config.yaml` changed → `pnpm codegen`
2. TypeScript files changed → `pnpm tsc --noEmit`
3. Compilation succeeds → `TUI_OFF=true pnpm dev` to test runtime

### Environment Requirements
- Node.js v20 (exactly - no higher/lower)
- pnpm (not npm/yarn)
- Docker running (for database)

## Common Pitfalls

1. **Forgetting await**: `context.Entity.get()` returns Promise
2. **Using null instead of undefined**: Optional fields use `undefined`, not `null`
3. **Direct mutation**: Entities are immutable - use spread operator
4. **Missing field_selection**: Transaction data requires explicit config
5. **Wrong BigDecimal usage**: Use `new BigDecimal()` and its methods
6. **Lowercase token addresses**: Always use `.toLowerCase()` for address lookups in maps

## Example Pattern: Create or Update Entity

```typescript
// Get existing or create new
let stats = await context.ProtocolStats.get(PROTOCOL_ID);

if (!stats) {
  stats = {
    id: PROTOCOL_ID,
    poolCount: 0,
    volumeTotalETH: new BigDecimal(0),
    // ... other fields
  };
}

// Update (immutable pattern)
const updated = {
  ...stats,
  poolCount: stats.poolCount + 1,
  volumeTotalETH: stats.volumeTotalETH.plus(newVolume)
};

context.ProtocolStats.set(updated);
```

## Project-Specific Logic

- **Whale Detection**: Transactions exceeding thresholds in `WHALE_THRESHOLDS` create/update `WhaleActivity` entities
- **Hourly Snapshots**: Protocol stats captured every hour (timestamp truncation pattern)
- **Token Symbols**: Hardcoded map for mainnet tokens (ETH, USDC, WBTC, DAI)
- **Volume Tracking**: Separate tracking for ETH and USDC volumes

## Resources
- Full HyperIndex docs: https://docs.envio.dev/docs/HyperIndex-LLM/hyperindex-complete
- Example indexers: https://github.com/enviodev/uniswap-v4-indexer
