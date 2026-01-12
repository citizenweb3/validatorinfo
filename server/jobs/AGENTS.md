# Jobs Module (Indexer Jobs)

**Purpose:** Background cron jobs for indexing and updating blockchain data in the database.

## Key Files

| File | Description |
|------|-------------|
| `get-prices.ts` | Fetches token prices via CoinGecko API |
| `get-nodes.ts` | Syncs validators/nodes for each chain |
| `get-coingecko-data.ts` | Fetches market cap, volume, and other market data |
| `get-chain-uptime.ts` | Updates chain uptime metrics |
| `update-chain-apr.ts` | Updates APR for all networks |
| `update-chain-tvs.ts` | Updates Total Value Staked |
| `update-chain-proposals.ts` | Syncs governance proposals |
| `update-chain-staking-params.ts` | Updates staking parameters (unbonding time, max validators) |
| `update-chain-slashing-params.ts` | Updates slashing parameters |
| `update-slashing-infos.ts` | Updates slashing data and missed blocks |
| `update-nodes-votes.ts` | Updates validator voting records |
| `update-nodes-rewards.ts` | Updates validator rewards |
| `update-nodes-commissions.ts` | Updates validator commissions |
| `sync-aztec-events.ts` | Syncs Aztec blockchain events |
| `sync-aztec-committee.ts` | Syncs Aztec committee members |
| `update-aztec-*.ts` | Aztec-specific update jobs (stake, coinbase, L1 contracts) |
| `update-validators-by-keybase.ts` | Updates validator metadata from Keybase |
| `update-validators-by-site.ts` | Updates validator metadata from websites |
| `check-nodes-health.ts` | Health checks for nodes |
| `match-chain-nodes.ts` | Matches nodes to validators |

## Dependencies

- `@/db` - Prisma client for PostgreSQL operations
- `@/logger` - Logging utility
- `@/server/tools/chains/params` - Configuration for all blockchains
- `@/server/tools/chains/methods` - Chain-specific data fetching methods
- `@/services/*` - Services for data persistence

## Used By

- `server/indexer.ts` - Main orchestrator, runs jobs on cron schedules
- `server/task-worker.ts` - Worker thread, executes individual jobs

## Structure

```
server/jobs/
├── get-*.ts              # Fetch data from external sources
│   ├── get-prices.ts           # CoinGecko prices
│   ├── get-nodes.ts            # Validators/nodes from chains
│   ├── get-coingecko-data.ts   # Market cap, volume, etc.
│   └── get-chain-uptime.ts     # Chain uptime metrics
│
├── update-chain-*.ts     # Update network parameters
│   ├── update-chain-apr.ts
│   ├── update-chain-tvs.ts
│   ├── update-chain-proposals.ts
│   ├── update-chain-staking-params.ts
│   └── update-chain-slashing-params.ts
│
├── update-nodes-*.ts     # Update node/validator data
│   ├── update-nodes-votes.ts
│   ├── update-nodes-rewards.ts
│   └── update-nodes-commissions.ts
│
├── sync-aztec-*.ts       # Aztec-specific syncs
│   ├── sync-aztec-events.ts
│   ├── sync-aztec-committee.ts
│   └── update-aztec-*.ts
│
├── update-validators-*.ts # Validator metadata
│   ├── update-validators-by-keybase.ts
│   ├── update-validators-by-site.ts
│   └── update-validators-aztec-logos.ts
│
└── check-nodes-health.ts  # Node health checks
```

## Common Patterns

### 1. Standard Job File Structure
```typescript
import db from '@/db';
import logger from '@/logger';
import { chainParamsArray } from '@/server/tools/chains/params';
import getChainMethods from '@/server/tools/chains/methods';

const { logInfo, logError } = logger('job-name');

export const jobFunction = async (chains?: string[]) => {
  for (const chain of chainParamsArray) {
    try {
      const methods = getChainMethods(chain.name);
      const data = await methods.getSomeData(chain);
      // Update database via Prisma
      await db.model.update({ ... });
    } catch (e) {
      logError(`Error for ${chain.name}:`, e);
    }
  }
};
```

### 2. Chain Iteration
- All jobs iterate over `chainParamsArray` from `params.ts`
- For each chain, get methods via `getChainMethods(chain.name)`
- Errors are caught per-chain so one network doesn't block others

### 3. Job Registration
1. Export job function from file
2. Import in `server/task-worker.ts`
3. Register in switch-case by task name
4. Add to `tasks` or `specialTasks` array in `server/indexer.ts`

### 4. Cron Schedules
```typescript
// server/indexer.ts
const timers = {
  every5mins: '*/5 * * * *',
  every10mins: '*/10 * * * *',
  every30mins: '*/30 * * * *',
  everyHour: '0 * * * *',
  every6hours: '0 */6 * * *',
  everyDay: '0 0 * * *',
  in15MinEveryHour: '15 * * * *',
  in30MinEveryHour: '30 * * * *',
  in45MinEveryHour: '45 * * * *',
};
```

### 5. Task Types
- **Regular tasks**: Run immediately on startup + scheduled
- **Special tasks**: Run 5 minutes after startup (wait for validators to update first)