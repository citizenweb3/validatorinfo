# Cosmoshub Indexer Integration — Design

**Date:** 2026-05-08
**Branch:** `feat/cosmos-indexer-integration` (off `dev`)
**Scope:** Integrate `cosmos-indexer-api` (separate repo `chain-data-indexer`, branch `cosmos-indexer-api`) into ValidatorInfo for chain `cosmoshub`. Adds blocks and transactions UI plus tx-metrics (totalTxs, txsLast24h, tps, avgFee). Mirrors patterns established for Aztec and Logos-testnet.

---

## 1. Background

### 1.1 cosmos-indexer-api summary

Read-only Next.js 16 JSON API over the `chain-data-indexer` Postgres DB.

| Aspect | Value |
|---|---|
| Auth | `x-api-key` header (timingSafeEqual, single key) |
| Pagination | Keyset: `before_height` + `before_index`, `limit+1` probe → `has_more`, returns cursor `{next_before_height[, next_before_index]}` |
| Numeric fields | All `uint64` (height, gas, totals) serialized as decimal strings |
| Cache | `Cache-Control: private` on auth-gated routes |

**Endpoints used by this integration:**

| Path | Returns |
|---|---|
| `GET /api/v1/health` | `SELECT 1` |
| `GET /api/v1/blocks?limit&before_height` | `{data: BlockSummary[], cursor, has_more, total}` |
| `GET /api/v1/blocks/height/{h}` | `{data: BlockDetail}` |
| `GET /api/v1/blocks/stats` | `{data: {total_blocks, last_height}}` |
| `GET /api/v1/txs?limit&before_height&before_index` | `{data: TxSummary[], cursor, has_more, total}` |
| `GET /api/v1/txs/{hash}` | `{data: TxDetail}` (includes `messages[]`, `events[]`) |
| `GET /api/v1/txs/{hash}/raw` | `{data: {raw_tx}}` |
| `GET /api/v1/txs/stats` | `{data: {total_txs, last_height}}` (60s in-memory cache + inflight dedup on indexer side) |

**Schemas (zod-mirrored):**

```ts
BlockSummary { block_hash, height, time, tx_count, proposer_address }
BlockDetail extends Summary + { size_bytes, last_commit_hash, data_hash, app_hash, evidence_count }

TxSummary { tx_hash, height, tx_index, time, code, first_msg_type, fee:{amount,denom}|null }
Fee { amount: [{amount, denom}], gas_limit, payer, granter }
Message { msg_index, type_url, value, signer }
Event { msg_index, event_index, event_type, attributes }
TxDetail { ...summary, gas_wanted, gas_used, fee: Fee|null, memo, signers, log_summary, messages, events }
```

### 1.2 Existing ValidatorInfo patterns

| Pattern | Source |
|---|---|
| Per-chain API client folder | `src/app/services/{chain}-indexer-api/` (Aztec, Logos) |
| Block/tx dispatch by chain | `BlocksService.getBlocksByChainName`, `TxService.getTxsByChainName` |
| Tx metrics storage | Prisma `chainTxMetrics` (totalTxs, txsLast24h, tps, avgFee, txs30d), populated by `server/jobs/update-tx-metrics.ts` (cron `everyDay`) |
| Daily snapshot for delta-based metrics | Prisma `chainTxDailySnapshot` (totalTxs per UTC day), Logos pattern |
| Chain methods | `server/tools/chains/{chain}/methods.ts` exports `ChainMethods` record |
| Null fallback | `null-tx-metrics.ts` returns null for all 4 tx metrics — currently spread into `cosmoshub/methods.ts` |

---

## 2. Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Target chain | `cosmoshub` mainnet | Already registered in `params.ts` |
| Scope | UI (blocks + txs) + tx metrics | Surfaces real-time + aggregate data |
| Metrics strategy | Hybrid: stats endpoints for totals, snapshot delta for `txsLast24h`, local aggregation for `tps`/`avgFee` | No indexer changes needed, real values for all metrics |
| Auth | `x-api-key` header (not Bearer) | Matches indexer; no indexer change |
| Deployment | Already deployed at prod URL | No infra work |

---

## 3. Architecture

### 3.1 New / changed files

```
src/app/services/cosmos-indexer-api/         NEW
├── client.ts                                 fetch + timeout + safeJsonParse + x-api-key
├── endpoints.ts                              typed wrappers per endpoint
├── types.ts                                  CosmosBlock{Summary,Detail}, CosmosTx{Summary,Detail}, CosmosListResponse<T>
└── index.ts                                  export const cosmosIndexer = {...}

src/app/services/blocks-service.ts            getCosmosBlocks + dispatch for 'cosmoshub'
src/app/services/tx-service.ts                getCosmosTxs, getCosmosTxByHash, getCosmosTxMetrics + dispatch

server/tools/chains/cosmoshub/
├── get-total-txs.ts                          NEW  /txs/stats → bigint
├── get-txs-last-24h.ts                       NEW  snapshot delta (Logos pattern)
├── get-tps.ts                                NEW  local aggregation /blocks?limit=100
├── get-avg-fee.ts                            NEW  local aggregation /txs?limit=100, uatom only
└── methods.ts                                override 4 methods after ...nullTxMetrics

src/app/[locale]/networks/[name]/blocks/[hash]/cosmos-block-information.tsx    NEW
src/app/[locale]/networks/[name]/blocks/[hash]/block-information.tsx           chain-aware delegation
src/app/[locale]/networks/[name]/blocks/[hash]/expand/expanded-block-information.tsx
src/app/[locale]/networks/[name]/blocks/[hash]/json/json-block-information.tsx
src/app/[locale]/networks/[name]/blocks/blocks-table/network-blocks.tsx        column header for cosmoshub
src/app/[locale]/networks/[name]/blocks/blocks-table/network-blocks-list.tsx

src/app/[locale]/networks/[name]/tx/[hash]/cosmos-tx-information.tsx           NEW
src/app/[locale]/networks/[name]/tx/[hash]/tx-information.tsx                  chain-aware delegation
src/app/[locale]/networks/[name]/tx/[hash]/expand/expanded-cosmos-tx-information.tsx  NEW
src/app/[locale]/networks/[name]/tx/[hash]/json/json-tx-information.tsx        cosmoshub branch
src/app/[locale]/networks/[name]/tx/txs-table/network-txs-items.tsx
src/app/[locale]/networks/[name]/tx/txs-table/network-txs-list.tsx
src/app/[locale]/networks/[name]/tx/txs-table/network-txs.tsx
src/app/[locale]/networks/[name]/tx/total-txs-metrics.tsx
src/app/[locale]/networks/[name]/overview/network-overview.tsx                 isCosmoshub branch

messages/{en,pt,ru}.json                      new BlockInformationPage + TxInformationPage keys

.env.example                                  COSMOS_INDEXER_BASE_URL, COSMOS_INDEXER_API_KEY
```

### 3.2 Service layer (`cosmos-indexer-api`)

**`client.ts`** — clone of `logos-indexer-api/client.ts` with two changes:

```ts
const buildHeaders = (custom?: HeadersInit): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  const apiKey = process.env.COSMOS_INDEXER_API_KEY;
  if (apiKey) headers['x-api-key'] = apiKey;       // not Bearer
  // merge custom headers ...
  return headers;
};

const buildUrl = (path: string, params?: QueryParams) =>
  `${process.env.COSMOS_INDEXER_BASE_URL}${path}` + qs(params);
```

Same fetchWithTimeout, safeJsonParse, request, get, post, healthCheck, getBaseUrl as Logos.

**`types.ts`** — mirrors `chain-data-indexer/src/schemas/{blocks,txs}.ts`. All BigInt-derived fields are typed as `string`.

**`endpoints.ts`:**

```ts
export const getBlocksList = (p, opts?) =>
  client.get<CosmosListResponse<CosmosBlockSummary>>('/api/v1/blocks', p, opts);
export const getBlockByHeight = (h, opts?) =>
  client.get<{data: CosmosBlockDetail}>(`/api/v1/blocks/height/${h}`, null, opts);
export const getBlocksStats = (opts?) =>
  client.get<{data: CosmosBlocksStats}>('/api/v1/blocks/stats', null, opts);
export const getTxsList = (p, opts?) =>
  client.get<CosmosListResponse<CosmosTxSummary>>('/api/v1/txs', p, opts);
export const getTxByHash = async (hash, opts?) => {
  try { return await client.get<{data: CosmosTxDetail}>(`/api/v1/txs/${hash}`, null, opts); }
  catch (e) { if (e.message.includes('HTTP 404')) return null; throw e; }
};
export const getTxRaw = async (hash, opts?) => { ... };
export const getTxsStats = (opts?) => client.get<{data: CosmosTxsStats}>('/api/v1/txs/stats', null, opts);
```

**`index.ts`:**

```ts
export * from './types';
export const cosmosIndexer = { getBlocksList, getBlockByHeight, getBlocksStats,
                                getTxsList, getTxByHash, getTxRaw, getTxsStats, healthCheck };
export default cosmosIndexer;
```

### 3.3 Chain methods + cron

**`get-total-txs.ts`:**

```ts
const getTotalTxs: GetTotalTxs = async () => {
  const { data } = await cosmosIndexer.getTxsStats({ cache: 'no-store' });
  return BigInt(data.total_txs);
};
```

**`get-txs-last-24h.ts`** — exact Logos pattern (read yesterday UTC snapshot, subtract from current `total_txs`, return null if no snapshot).

**`get-tps.ts`** — local aggregation:

```ts
const TPS_BLOCK_WINDOW = 100;
const getTps: GetTps = async () => {
  const { data } = await cosmosIndexer.getBlocksList({ limit: TPS_BLOCK_WINDOW }, { cache: 'no-store' });
  if (data.length < 2) return null;
  const sorted = [...data].sort((a,b) => Number(a.height) - Number(b.height));
  const totalTxs = sorted.reduce((s, b) => s + b.tx_count, 0);
  const elapsedSec = Math.max((new Date(sorted.at(-1)!.time).getTime()
                              - new Date(sorted[0].time).getTime()) / 1000, 1);
  return totalTxs / elapsedSec;
};
```

**`get-avg-fee.ts`** — local aggregation, uatom only:

```ts
const getAvgFee: GetAvgFee = async () => {
  const { data } = await cosmosIndexer.getTxsList({ limit: 100 }, { cache: 'no-store' });
  const fees = data
    .filter(t => t.code === 0 && t.fee?.amount && t.fee.denom === 'uatom')
    .map(t => BigInt(t.fee!.amount!));
  if (fees.length === 0) return null;
  const sum = fees.reduce((a,b) => a+b, 0n);
  return (sum / BigInt(fees.length)).toString();
};
```

**`cosmoshub/methods.ts`:**

```ts
import getTotalTxs from '@/server/tools/chains/cosmoshub/get-total-txs';
import getTxsLast24h from '@/server/tools/chains/cosmoshub/get-txs-last-24h';
import getTps from '@/server/tools/chains/cosmoshub/get-tps';
import getAvgFee from '@/server/tools/chains/cosmoshub/get-avg-fee';

const chainMethods: ChainMethods = {
  ...nullTxMetrics,                  // fallback no longer used; explicit override below
  getNodes, /* ... unchanged ... */
  getTotalTxs, getTxsLast24h, getTps, getAvgFee,
};
```

`server/jobs/update-tx-metrics.ts` and `server/tools/chains/chains.ts` are NOT modified — cosmoshub already in auto-derived chains array, job already iterates it. Returning real values from the 4 methods is sufficient.

### 3.4 UI layer

**`blocks-service.getCosmosBlocks`** — heights are dense, compute keyset boundary directly:

```ts
const getCosmosBlocks = async (currentPage, perPage) => {
  try {
    const stats = await cosmosIndexer.getBlocksStats({ cache: 'no-store' });
    const lastHeight = BigInt(stats.data.last_height);
    if (lastHeight <= 0n) return { blocks: [], totalPages: 1 };
    const totalPages = Math.max(1, Math.ceil(Number(lastHeight) / perPage));
    const beforeHeight = lastHeight - BigInt((currentPage - 1) * perPage) + 1n;
    const { data } = await cosmosIndexer.getBlocksList(
      { limit: perPage, before_height: beforeHeight.toString() }, { cache: 'no-store' });
    const blocks = data.map(b => ({
      hash: b.block_hash,
      height: b.height,
      timestamp: formatTimestamp(new Date(b.time)),
      finalizationStatus: 3,                       // Tendermint: instant finality
    }));
    return { blocks, totalPages };
  } catch (e) { console.error('cosmos blocks fail:', e); return { blocks: [], totalPages: 1 }; }
};
```

Dispatch: `if (normalizedChainName === 'cosmoshub') return getCosmosBlocks(...);`

**`tx-service.getCosmosTxs`** — keyset is forward-only. For arbitrary `currentPage` we walk via cursor in chunks.

```ts
const getCosmosTxs = async (currentPage, perPage) => {
  const stats = await cosmosIndexer.getTxsStats(TX_LIST_CACHE);
  const total = Number(stats.data.total_txs);
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const skip = (currentPage - 1) * perPage;

  let cursor: { before_height?: string; before_index?: number } | undefined;
  let walked = 0;
  while (walked < skip) {
    const step = Math.min(perPage, skip - walked);
    const r = await cosmosIndexer.getTxsList({ limit: step, ...cursor }, TX_LIST_CACHE);
    if (!r.has_more || !r.cursor) break;
    cursor = { before_height: r.cursor.next_before_height, before_index: r.cursor.next_before_index };
    walked += r.data.length;
  }
  const page = await cosmosIndexer.getTxsList({ limit: perPage, ...cursor }, TX_LIST_CACHE);

  const txs: TxItem[] = page.data.map(t => ({
    hash: t.tx_hash,
    status: t.code === 0 ? 'confirmed' : 'dropped',  // code≠0 = failed cosmos tx
    blockHeight: Number(t.height),
    timestamp: new Date(t.time).getTime(),
    transactionFee: t.fee?.amount ?? undefined,
    opType: t.first_msg_type ?? undefined,
  }));
  return { txs, totalPages };
};

const getCosmosTxByHash = async (hash: string) => {
  const tx = await cosmosIndexer.getTxByHash(hash, { cache: 'no-store' });
  return tx ? { status: tx.data.code === 0 ? 'confirmed' : 'dropped', data: tx.data } : null;
};

const getCosmosTxMetrics = async (chainId: number) => { /* read chainTxMetrics, same as Logos */ };
```

**Detail components** (mirror Logos):
- `cosmos-block-information.tsx` — 9 rows (block_hash, height, time, proposer, tx_count, size_bytes, last_commit_hash, app_hash, evidence_count)
- `cosmos-tx-information.tsx` — main fields (hash, height, time, code, gas_wanted, gas_used, fee, signers[], memo, log_summary)
- `expanded-cosmos-tx-information.tsx` — `messages[]` (collapsible, type_url badges, value JSON) + `events[]` grouped by `msg_index`
- `json-tx-information.tsx` — cosmoshub branch reads `cosmosIndexer.getTxRaw(hash)`

**Chain-aware delegation** — existing `block-information.tsx`, `tx-information.tsx`, `network-blocks.tsx`, `network-txs-items.tsx`, `total-txs-metrics.tsx`, `network-overview.tsx` get an `if (chainName === 'cosmoshub') return <CosmosX ... />` branch. Block table column header: `Height` (dense heights, no slot column).

**i18n** — new keys in `messages/{en,pt,ru}.json`:
- `BlockInformationPage`: `evidenceCount`, `lastCommitHash`, `appHash`, `dataHash`, `sizeBytes`
- `TxInformationPage`: `logSummary`, `memo`, `signers`, `events`, `messages`, `gasWanted`, `gasUsed`

---

## 4. Phasing

### Stage 1 — Service layer + chain methods (no UI)

1. `src/app/services/cosmos-indexer-api/{client,endpoints,types,index}.ts`
2. `.env.example` — `COSMOS_INDEXER_BASE_URL`, `COSMOS_INDEXER_API_KEY`
3. `cosmoshub/get-{total-txs,txs-last-24h,tps,avg-fee}.ts`
4. `cosmoshub/methods.ts` — override 4 methods after `...nullTxMetrics`
5. **Smoke test:** node script invokes `cosmosIndexer.getBlocksStats() / getTxsStats()` against prod
6. **Validation:** run `update-tx-metrics` manually for `['cosmoshub']` → confirm `chainTxMetrics` row populated with real values
7. `yarn lint && yarn build` clean

### Stage 2 — UI (blocks)

1. `blocks-service.getCosmosBlocks` + dispatch
2. `cosmos-block-information.tsx`
3. Delegation in `block-information.tsx`, `expanded-block-information.tsx`, `json-block-information.tsx`, `network-blocks.tsx` (`Height` column for cosmoshub)
4. i18n keys (3 locales)
5. **Manual test:** `/networks/cosmoshub/blocks` paginates, detail page renders, JSON view works

### Stage 3 — UI (txs)

1. `tx-service.getCosmosTxs`, `getCosmosTxByHash`, `getCosmosTxMetrics` + dispatch
2. `cosmos-tx-information.tsx`
3. `expanded-cosmos-tx-information.tsx` (messages + events)
4. `network-txs-items.tsx`, `network-txs-list.tsx`, `total-txs-metrics.tsx`, `network-overview.tsx` — `isCosmoshub` branches
5. `json-tx-information.tsx` — cosmoshub via `getTxRaw`
6. i18n keys
7. **Manual test:** `/networks/cosmoshub/tx` list + detail + raw JSON; failed-tx (`code≠0`) renders correctly
8. `network-profile-header.tsx` — confirm Blocks/Txs tabs visible for cosmoshub

### Stage 4 — Polish

- TPS / avgFee surface on `network-overview.tsx`
- `chainTxDailySnapshot` populated → `txs30d` works after 1-2 daily ticks

---

## 5. Testing strategy

### API smoke

```bash
curl -H "x-api-key: $COSMOS_INDEXER_API_KEY" \
  $COSMOS_INDEXER_BASE_URL/api/v1/blocks/stats
curl -H "x-api-key: ..." "$URL/api/v1/blocks?limit=5"
curl -H "x-api-key: ..." "$URL/api/v1/txs?limit=5"
curl -H "x-api-key: ..." "$URL/api/v1/txs/stats"
```

### Indexer job

```bash
docker compose -f docker-compose.dev.yml exec indexer node -e \
  "require('./dist/server/jobs/update-tx-metrics').default(['cosmoshub']).then(()=>process.exit())"
```

Expected: `chainTxMetrics` row for cosmoshub has `totalTxs`, `tps`, `avgFee` non-null; `txsLast24h` null on first run, populated on day 2.

### Build / lint

```bash
yarn lint
yarn build
```

### UI manual

- `/networks/cosmoshub/blocks` — page 1, page 2, deep page
- `/networks/cosmoshub/blocks/<hash>` — detail, expand, JSON
- `/networks/cosmoshub/tx` — page 1, deep page (verify keyset walk completes in reasonable time)
- `/networks/cosmoshub/tx/<hash>` — detail, expand (messages + events render), JSON (raw_tx)
- Failed tx (`code !== 0`) — status badge correct
- `/networks/cosmoshub` overview — totalTxs, tps, avgFee surface

---

## 6. Risks / open items

| Risk | Mitigation |
|---|---|
| Tx pagination via iterative keyset is O(currentPage) — slow at deep pages | Cap UI `totalPages` at e.g. 50, or accept latency. Revisit in Stage 3 |
| `total_txs` from `pg_class.reltuples` is estimate, not exact count | Sufficient for display; documented in indexer AGENTS.md |
| Failed-tx semantics (`code≠0`): cosmos tx is included in block but execution failed | Show `failed`, not `dropped`. i18n key `TxStatus.failed` |
| Indexer downtime breaks cosmoshub page render | All service methods catch errors, return empty arrays. Logs surfaced to console |
| `avgFee` filtering only uatom — txs paying in other denoms (rare on cosmoshub) excluded | Acceptable; cosmoshub native fee denom is uatom |
| Cron `update-tx-metrics` failure for cosmoshub block other chains | Job already wraps each `processChain` in try/catch (line 161) |

---

## 7. Out of scope

- Replacing existing cosmoshub data sources (governance, staking, nodes) with indexer
- Other cosmos chains beyond cosmoshub (cosmoshub-testnet, osmosis, etc.) — design extends naturally per chain
- Search by address / multi-message filters — current API does not expose
- WebSocket / realtime tx feed
