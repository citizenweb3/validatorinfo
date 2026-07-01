# Miden Testnet Integration — Design

**Date:** 2026-05-12
**Branch:** `feat/miden-integration` (from `dev`)
**Mirrors:** Logos integration (`c66fbf9` + `48b3c18`)
**Scope:** Stage 1 (registration + uptime via indexer) + Stage 2 (UI for blocks).
Tx metrics (Stage 3) deferred until the indexer indexes transactions.

---

## 1. Data sources

### Indexer REST (primary, like Logos)
- Base: `https://indexer.miden-testnet.citizenweb3.com`
- Auth: `Authorization: Bearer <MIDEN_INDEXER_API_TOKEN>`
- Endpoints used:
  - `GET /health` (root) — liveness probe
  - `GET /api/v1/stats` — `last_block`, `total_blocks`, `total_transactions`,
    `total_notes`, `total_nullifiers`, `total_accounts`, `latest_block_timestamp`
  - `GET /api/v1/blocks?limit=&offset=&sort=block_num&order=desc` — paginated list
  - `GET /api/v1/blocks/:block_num` — block detail (incl. `raw_block_bytes`)
- Known indexer issue (not fixed on the explorer side): server currently
  returns `block_num` lexicographically and ignores `sort/order`. Backend will
  fix; the explorer passes `sort=block_num&order=desc` as if it works.

### gRPC (`grpc.miden.citizenweb3.com:443`)
Live data source (chain tip, headers). Service: `rpc.Api`. Reflection enabled.
Methods discovered: `Status`, `GetLimits`, `GetBlockByNumber`,
`GetBlockHeaderByNumber`, `GetAccount`, `GetNotesById`, `GetNoteScriptByRoot`,
`CheckNullifiers`, `SyncState`, `SyncNotes`, `SyncNullifiers`,
`SyncAccountVault`, `SyncAccountStorageMaps`, `SyncTransactions`,
`SubmitProvenBatch`, `SubmitProvenTransaction`.

**Not used in Stages 1–2.** Listed for future reference (e.g. live chain tip,
mempool stats). Current chain tip via gRPC `Status` is ~2.4M while indexer is
at ~82.6k — divergence acknowledged; the indexer team will catch up.

### Miden as ecosystem
- Standalone (org renamed `0xPolygonMiden` → `0xMiden`, separated from Polygon).
- STARK-based zkVM rollup, client-side proving, privacy-preserving smart
  contracts. Centralized block producer in testnet (single `validator_key` per
  header). No PoS / no validators-as-stakers ⇒ `hasValidators: false`.

---

## 2. Chain registration

### `server/tools/chains/params.ts`

Add `miden` to `ecosystemParams`:
```ts
{
  name: 'miden',
  prettyName: 'Miden',
  logoUrl: 'https://raw.githubusercontent.com/citizenweb3/staking/refs/heads/chain-images/miden/miden.svg',
  tags: ['Privacy', 'zkVM', 'STARK', 'Client-side Proving'],
},
```

Add `miden-testnet` to `chainParams`:
```ts
'miden-testnet': {
  rang: 3,
  ecosystem: 'miden',
  hasValidators: false,
  name: 'miden-testnet',
  prettyName: 'Miden Testnet',
  shortDescription: 'STARK-based zkVM rollup with client-side proving and privacy-preserving smart contracts',
  chainId: 'miden-testnet-v0.13',
  bech32Prefix: '',
  coinDecimals: 0,
  coinGeckoId: '',
  coinType: 0,
  denom: '',
  minimalDenom: '',
  logoUrl: 'https://raw.githubusercontent.com/citizenweb3/staking/refs/heads/chain-images/miden/miden.svg',
  nodes: [
    { type: 'grpc', url: 'https://grpc.miden.citizenweb3.com', provider: 'citizenweb3' },
    { type: 'indexer', url: 'https://indexer.miden-testnet.citizenweb3.com', provider: 'citizenweb3' },
  ],
  mainRepo: 'https://github.com/0xMiden/miden-node',
  docs: 'https://0xmiden.github.io/miden-docs/',
  githubUrl: 'https://github.com/0xMiden',
  twitterUrl: 'https://x.com/0xMiden',
  tags: ['Miden Ecosystem', 'Testnet', 'zkVM', 'Privacy', 'STARK', 'Client-side Proving'],
},
```

### `server/tools/chains/chains.ts`
Add `'miden-testnet'` to the chains array.

### `server/tools/chains/methods.ts`
```ts
import midenTestnetMethods from '@/server/tools/chains/miden-testnet/methods';
// ...
'miden-testnet': midenTestnetMethods,
```

---

## 3. Chain methods

`server/tools/chains/miden-testnet/methods.ts` — mirrors Logos stubs; only
`getChainUptime` implemented. All validator/staking/proposal methods return
empty/null. Tx-metrics methods (`getTotalTxs`, `getTxsLast24h`, `getTps`,
`getAvgFee`) return `null` in Stage 1 (added in Stage 3).

`server/tools/chains/miden-testnet/types.ts` — shared types used by chain
methods (re-exports from `services/miden-indexer-api/types.ts` is acceptable
once that exists; otherwise local declarations).

`server/tools/chains/miden-testnet/get-chain-uptime.ts`:
- Token env: `MIDEN_INDEXER_API_TOKEN`
- Indexer URL: from `params.ts` (`type: 'indexer'`)
- Steps:
  1. `GET /api/v1/stats` → `last_block` → `uptimeHeight = Number(last_block)`
  2. `GET /api/v1/blocks?limit=100&sort=block_num&order=desc`
  3. Median of `Δtimestamp / Δblock_num` over the page → `blockTimeMs`
  4. Return `{ lastUptimeUpdated, uptimeHeight, avgTxInterval: blockTimeMs, blockTime: blockTimeMs }`
- Fallback `FALLBACK_BLOCK_TIME_MS = 1000` if sampling fails
- Timeout: 8000 ms via `AbortController`
- Logger tag: `miden-chain-uptime`

`.env.example`:
```
MIDEN_INDEXER_URL=https://indexer.miden-testnet.citizenweb3.com
MIDEN_INDEXER_API_TOKEN=
```

---

## 4. Services — `src/app/services/miden-indexer-api/`

Mirror `logos-indexer-api/` (4 files):

### `client.ts`
- `MIDEN_INDEXER_BASE_URL` from env, fallback to citizenweb3 URL
- `MIDEN_INDEXER_API_TOKEN` Bearer auth
- `get<T>(path, params, options)` with timeout, 404→typed error, Next revalidate hint

### `types.ts`
```ts
export interface MidenStats {
  last_block: string;
  total_blocks: number;
  total_transactions: number;
  total_notes: number;
  total_nullifiers: number;
  total_accounts: number;
  latest_block_timestamp: string;
}

export interface MidenBlock {
  block_num: string;
  block_hash: string;
  prev_block_commitment: string;
  chain_commitment: string;
  account_root: string;
  nullifier_root: string;
  note_root: string;
  tx_commitment: string;
  validator_key: string;
  tx_kernel_commitment: string;
  native_asset_id: string;
  verification_base_fee: string;
  timestamp: string;
  tx_count: number;
  note_count: number;
  nullifier_count: number;
  version: number;
  chain_length: number | null;
  inserted_at: string;
  raw_block_bytes?: string;
}

export interface MidenBlocksResponse {
  data: MidenBlock[];
  total: number;
  limit: number;
  offset: number;
}
```

### `endpoints.ts`
- `getStats(opts?) → MidenStats`
- `getBlocks({ limit, offset, sort, order }, opts?) → MidenBlocksResponse`
- `getBlock(blockNum, opts?) → MidenBlock | null` (404 → null)

### `index.ts`
Re-export.

---

## 5. UI

### `src/app/services/blocks-service.ts`
Add `getMidenBlocks(currentPage, perPage) → BlocksResponse`:
- `pageSize = clamp(perPage, 1, 100)`
- `getStats({ cache: 'no-store' })` → `totalBlocks`
- `totalPages = ceil(totalBlocks / pageSize)`
- `getBlocks({ limit, offset, sort: 'block_num', order: 'desc' })`
- Map to `BlockItem`:
  - `hash` = `block_hash`
  - `height` = `Number(block_num)`
  - `timestamp` = `formatTimestamp(new Date(b.timestamp))`
  - `finalizationStatus` = `3` (Miden blocks are final on publication)
- Add branch in `getBlocksByChainName`:
  ```ts
  if (normalizedChainName === 'miden-testnet') return getMidenBlocks(currentPage, perPage);
  ```

### `networks/[name]/blocks/[hash]/miden-block-information.tsx`
14 detail rows (mirror logos-block-information shape):
1. block hash
2. block number
3. parent commitment (`prev_block_commitment`)
4. chain commitment
5. account root
6. nullifier root
7. note root
8. tx commitment
9. validator key
10. tx kernel commitment
11. native asset id
12. verification base fee
13. timestamp
14. tx count / note count / nullifier count

Header pill: shows `block_num` and a "finalized" badge (always finalized).

### `block-information.tsx`
```ts
if (chain?.name === 'miden-testnet') {
  return <MidenBlockInformation chain={chain} hash={hash} />;
}
```

### `expand/expanded-block-information.tsx`
`isMiden` branch — extended block view with `raw_block_bytes` (collapsible).

### `json/json-block-information.tsx` + `json/page.tsx`
`isMiden` branch — return raw `MidenBlock` JSON.

### `blocks-table/network-blocks.tsx`
No column-header override needed (block_num is numeric height; standard
"Block" column works).

### `blocks-table/network-blocks-list.tsx`
Empty-state already covered by Logos PR.

### `(network-profile)/overview/network-overview.tsx`
`isMiden` branch — show `avgTxInterval` (block time from `getChainUptime`) and
last block height; "Indexer mode" label.

---

## 6. i18n (`messages/{en,pt,ru}.json` → `BlockInformationPage`)

New keys (3 files, identical structure):
- `block number`
- `parent commitment`
- `chain commitment`
- `account root`
- `nullifier root`
- `note root`
- `tx commitment`
- `tx kernel commitment`
- `validator key`
- `native asset id`
- `verification base fee`
- `note count`
- `nullifier count`
- `version`

---

## 7. PR breakdown

| Stage | Commit subject | Scope |
|-------|---------------|-------|
| 1 | `feat(miden-testnet): stage 1 — chain registration & indexer uptime` | `params.ts`, `chains.ts`, `methods.ts`, `miden-testnet/{methods,get-chain-uptime,types}.ts`, `.env.example`, indexer wiring if needed |
| 2 | `feat(miden-testnet): stage 2 — UI integration for blocks` | `services/miden-indexer-api/*`, `blocks-service.ts`, `miden-block-information.tsx`, `block-information.tsx`, expand/json branches, `network-overview.tsx`, `messages/{en,pt,ru}.json` |
| 3 (later) | `feat(miden-testnet): stage 3 — tx integration` | tx services, jobs, UI — once indexer indexes transactions |

---

## 8. Open items / follow-ups

1. **Indexer lag.** Currently `last_block=82599` vs chain tip ~2.4M. Backend team
   to catch up; explorer behavior is correct in either state.
2. **Indexer sort.** `sort=block_num&order=desc` currently no-op on the server;
   the explorer passes the params and expects them to be honored after the fix.
3. **Validator key per block.** Centralized producer for testnet; no UI surface
   beyond "validator key" field in block details.
4. **gRPC integration.** Deferred — no current UI need; `Status` could power a
   live "tip" widget in a later PR if helpful.
5. **chainId provisional.** `miden-testnet-v0.13` matches node `v0.13.4`. Update
   when Miden publishes an official identifier or genesis-commitment-based id.
