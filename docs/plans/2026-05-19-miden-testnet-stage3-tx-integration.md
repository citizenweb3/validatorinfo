# Miden Testnet — Stage 3: Transaction Integration

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Wire Miden testnet transactions into ValidatorInfo (tx list, tx detail page, tx metrics on overview), mirroring the Logos Stage 3 pattern (`96c6dbb`).

**Architecture:** Indexer at `https://indexer.miden-testnet.citizenweb3.com` now exposes `/api/v1/transactions` (list + detail) and includes `tps` in `/api/v1/stats`. Implement: (a) typed API client wrappers, (b) chain methods `getTotalTxs/getTps/getTxsLast24h/getAvgFee`, (c) `tx-service.ts` Miden branch, (d) tx-information UI branch for Miden, (e) translations for new Miden-specific field labels. Avg-fee returns `null` (Miden v1 fee semantics unclear; verification_base_fee is block-level, not tx-level).

**Tech Stack:** Next.js 14 (App Router + RSC), Prisma (`chainTxDailySnapshot`, `chainTxMetrics` tables already exist), TypeScript, Tailwind, next-intl, fetch wrapper in `miden-indexer-api/client.ts`.

**Reference commit:** `96c6dbb added txs to logos-testnet` — same structure, identical Prisma tables, same job `update-tx-metrics.ts`.

---

## Live indexer schema (verified 2026-05-19)

`GET /api/v1/stats`:
```json
{
  "last_block": 499699,
  "total_blocks": 499700,
  "total_transactions": 701103,
  "total_notes": 339327,
  "total_nullifiers": 176595,
  "total_accounts": 111872,
  "latest_block_timestamp": "2026-05-07T19:00:19.000Z",
  "tps": 97.1667
}
```

`GET /api/v1/transactions?limit=N&offset=M`:
```json
{
  "data": [{
    "tx_id": "0c02279bf25b8063b7fcd4de6b8abbf6701cab43fb50812863fe47d550015a85",
    "block_num": 499749,
    "account_id": "c5cd4390b149bc403053c44d97e5e2",
    "init_account_state": "b6e00eec...",
    "final_account_state": "ea108ce3...",
    "input_notes_commitment": "08de28fe...",
    "output_notes_commitment": "a276e4e9...",
    "expiration_block_num": null,
    "input_nullifiers": null,
    "output_note_ids": null,
    "inserted_at": "2026-05-19T08:07:46.691Z",
    "account_id_bech32": "miden1chx58y93fx7yqvznc3xe0e0zwyqrx7"
  }],
  "total": 701888, "limit": 3, "offset": 0
}
```

`GET /api/v1/transactions/{tx_id}` — assumed same shape (verify in Task 2).

⚠️ **Known indexer side-bugs (out of scope, file as separate issue to owner):**
- `last_block` field type fluctuates between `number` and `string` in `/stats`.
- `sort=block_num&order=desc` on `/blocks` returns lexicographic order (9999 between 99990/99989).

---

### Task 1: Verify tx detail endpoint shape

**Files:**
- Read-only verification step.

**Step 1: curl tx detail**

```bash
curl -s -H "Authorization: Bearer $MIDEN_INDEXER_API_TOKEN" \
  https://indexer.miden-testnet.citizenweb3.com/api/v1/transactions/0c02279bf25b8063b7fcd4de6b8abbf6701cab43fb50812863fe47d550015a85
```

Expected: same fields as list item, possibly extra metadata. If 404 on first try, pick a fresh `tx_id` from `?limit=1`.

**Step 2: Record actual fields in Task 2 types**

If detail has additional fields (e.g., `raw_tx_bytes`, `proof`), reflect them in `MidenTxDetail`. Otherwise reuse list-item shape.

**Step 3: No commit** — research step.

---

### Task 2: Extend `miden-indexer-api` types

**Files:**
- Modify: `src/app/services/miden-indexer-api/types.ts`

**Step 1: Add `tps` to `MidenStats`**

In `MidenStats` interface, add:
```ts
tps?: number;
```

(Optional because old responses lacked it; defensive.)

**Step 2: Add transaction types**

Append to `types.ts`:
```ts
export interface MidenTransaction {
  tx_id: string;
  block_num: number;
  account_id: string;
  init_account_state: string;
  final_account_state: string;
  input_notes_commitment: string;
  output_notes_commitment: string;
  expiration_block_num: number | null;
  input_nullifiers: string[] | null;
  output_note_ids: string[] | null;
  inserted_at: string;
  account_id_bech32: string;
}

export type MidenTxDetail = MidenTransaction;

export interface MidenTransactionsResponse {
  data: MidenTransaction[];
  total: number;
  limit: number;
  offset: number;
}
```

**Step 3: Type-check**

Run: `yarn build` (in lead's terminal, not in subagents per project rules).
Expected: no TS errors in miden-indexer-api files.

**Step 4: Commit**

⚠️ **Per user preference, do NOT auto-commit.** Lead reviews diff, user commits manually.

---

### Task 3: Add endpoints `getTransactions` / `getTransaction`

**Files:**
- Modify: `src/app/services/miden-indexer-api/endpoints.ts`
- Modify: `src/app/services/miden-indexer-api/index.ts`

**Step 1: Add endpoint signatures**

In `endpoints.ts`, after `getBlock`:

```ts
export interface GetTransactionsParams {
  limit?: number;
  offset?: number;
  sort?: 'block_num' | 'inserted_at';
  order?: 'asc' | 'desc';
  account_id?: string;
}

export const getTransactions = (
  params: GetTransactionsParams = {},
  options?: MidenIndexerRequestOptions,
): Promise<MidenTransactionsResponse> =>
  client.get<MidenTransactionsResponse>(
    '/api/v1/transactions',
    {
      limit: params.limit,
      offset: params.offset,
      sort: params.sort,
      order: params.order,
      account_id: params.account_id,
    },
    options,
  );

export const getTransaction = async (
  txId: string,
  options?: MidenIndexerRequestOptions,
): Promise<MidenTxDetail | null> => {
  try {
    return await client.get<MidenTxDetail>(
      `/api/v1/transactions/${encodeURIComponent(txId)}`,
      null,
      options,
    );
  } catch (e) {
    if (e instanceof Error && e.message.includes('HTTP 404')) {
      return null;
    }
    throw e;
  }
};
```

Also add the new type import at the top:
```ts
import { MidenBlock, MidenBlocksResponse, MidenIndexerRequestOptions, MidenStats, MidenTxDetail, MidenTransactionsResponse } from './types';
```

**Step 2: Export from `index.ts`**

Add to the default object:
```ts
import { getBlock, getBlocks, getStats, getTransactions, getTransaction } from './endpoints';
...
export const midenIndexer = {
  getStats,
  getBlocks,
  getBlock,
  getTransactions,
  getTransaction,
  healthCheck,
  getBaseUrl,
};
```

**Step 3: Manual smoke test**

```bash
docker exec validatorinfo-dev-frontend node -e "
import('./dist/services/miden-indexer-api/index.js').then(async m => {
  const r = await m.default.getTransactions({ limit: 2 });
  console.log(JSON.stringify(r, null, 2));
}).catch(e => { console.error(e); process.exit(1); });
"
```
(Or test through running `/networks/miden-testnet/tx` page after Task 7.)

---

### Task 4: Chain method — `getTotalTxs`

**Files:**
- Create: `server/tools/chains/miden-testnet/get-total-txs.ts`

**Step 1: Implement**

```ts
import midenIndexer from '@/services/miden-indexer-api';
import { GetTotalTxs } from '@/server/tools/chains/chain-indexer';

const getTotalTxs: GetTotalTxs = async () => {
  const stats = await midenIndexer.getStats({ cache: 'no-store' });
  return typeof stats?.total_transactions === 'number' ? BigInt(stats.total_transactions) : null;
};

export default getTotalTxs;
```

Mirrors `logos-testnet/get-total-txs.ts` exactly.

---

### Task 5: Chain method — `getTps`

**Files:**
- Create: `server/tools/chains/miden-testnet/get-tps.ts`

**Step 1: Implement**

Miden has `stats.tps` field — use directly, fall back to derivation if missing:

```ts
import midenIndexer from '@/services/miden-indexer-api';
import { GetTps } from '@/server/tools/chains/chain-indexer';
import getTxsLast24h from '@/server/tools/chains/miden-testnet/get-txs-last-24h';

// Miden indexer exposes `tps` in /stats. Use directly; fall back to derivation from 24h delta.
const getTps: GetTps = async (dbChain) => {
  const stats = await midenIndexer.getStats({ cache: 'no-store' });
  if (typeof stats?.tps === 'number' && Number.isFinite(stats.tps)) {
    return stats.tps;
  }
  const txsLast24h = await getTxsLast24h(dbChain);
  return txsLast24h !== null ? txsLast24h / 86400 : null;
};

export default getTps;
```

---

### Task 6: Chain method — `getTxsLast24h`

**Files:**
- Create: `server/tools/chains/miden-testnet/get-txs-last-24h.ts`

**Step 1: Copy Logos pattern**

Verbatim port of `logos-testnet/get-txs-last-24h.ts`, swapping `logosIndexer` → `midenIndexer`:

```ts
import db from '@/db';
import midenIndexer from '@/services/miden-indexer-api';
import { GetTxsLast24h } from '@/server/tools/chains/chain-indexer';

const getYesterdayUtc = (): Date => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - 1);
  return d;
};

const getTxsLast24h: GetTxsLast24h = async (dbChain) => {
  const stats = await midenIndexer.getStats({ cache: 'no-store' });
  const currentTotal =
    typeof stats?.total_transactions === 'number' ? stats.total_transactions : null;
  if (currentTotal === null) {
    return null;
  }

  const snapshot = await db.chainTxDailySnapshot.findUnique({
    where: { chainId_snapshotAt: { chainId: dbChain.id, snapshotAt: getYesterdayUtc() } },
  });
  if (!snapshot) {
    return null;
  }

  const delta = BigInt(currentTotal) - snapshot.totalTxs;
  return delta >= BigInt(0) ? Number(delta) : null;
};

export default getTxsLast24h;
```

---

### Task 7: Chain method — `getAvgFee` (null)

**Files:**
- Create: `server/tools/chains/miden-testnet/get-avg-fee.ts`

**Step 1: Implement**

```ts
import { GetAvgFee } from '@/server/tools/chains/chain-indexer';

// Miden testnet: tx-level fee not exposed in indexer (only block-level
// `verification_base_fee`). Tx schema lacks fee_amount; return null until
// the indexer surfaces per-tx fees.
const getAvgFee: GetAvgFee = async () => null;

export default getAvgFee;
```

---

### Task 8: Wire methods.ts

**Files:**
- Modify: `server/tools/chains/miden-testnet/methods.ts`

**Step 1: Replace `nullTxMetrics` spread with real methods**

```diff
- import nullTxMetrics from '@/server/tools/chains/null-tx-metrics';
+ import getAvgFee from '@/server/tools/chains/miden-testnet/get-avg-fee';
+ import getTotalTxs from '@/server/tools/chains/miden-testnet/get-total-txs';
+ import getTps from '@/server/tools/chains/miden-testnet/get-tps';
+ import getTxsLast24h from '@/server/tools/chains/miden-testnet/get-txs-last-24h';

  ...
    getChainUptime,
    getRewardAddress: async () => [],
-   ...nullTxMetrics,
+   getTotalTxs,
+   getTxsLast24h,
+   getTps,
+   getAvgFee,
  };
```

**Step 2: Update header comment**

Remove the "tx metrics are deferred to Stage 3" line — replace with brief note that Miden tx metrics are wired via indexer's `/transactions` and `stats.tps`.

---

### Task 9: tx-service.ts — `getMidenTxs` + `getMidenTxByHash` + `getMidenTxMetrics`

**Files:**
- Modify: `src/app/services/tx-service.ts`

**Step 1: Add Miden import block**

After existing `logosIndexer` imports:
```ts
import midenIndexer from '@/services/miden-indexer-api';
import { MidenTxDetail } from '@/services/miden-indexer-api';
```

**Step 2: Extend `TxItem` if needed**

Miden tx has `account_id_bech32`. Repurpose existing optional fields where possible (`feePayer` for account_id_bech32 won't fit semantically — Miden has no fee payer). Add one new optional:

```ts
export interface TxItem {
  ...
  // Miden-specific
  accountId?: string;
}
```

**Step 3: Implement list fetch**

After `getLogosTxs`, add:

```ts
const getMidenTxs = async (currentPage: number, perPage: number): Promise<TxsResponse> => {
  try {
    const offset = (currentPage - 1) * perPage;
    const [{ data, total }, stats] = await Promise.all([
      midenIndexer.getTransactions(
        { limit: perPage, offset, sort: 'block_num', order: 'desc' },
        TX_LIST_CACHE,
      ),
      midenIndexer.getStats(TX_LIST_CACHE),
    ]);

    const totalCount = total ?? (typeof stats?.total_transactions === 'number' ? stats.total_transactions : 0);
    const totalPages = Math.max(1, Math.ceil(totalCount / perPage));

    const txs: TxItem[] = data.map((tx) => ({
      hash: tx.tx_id,
      status: 'confirmed' as const,
      blockHeight: tx.block_num,
      timestamp: new Date(tx.inserted_at).getTime(),
      accountId: tx.account_id_bech32,
    }));

    return { txs, totalPages };
  } catch (error) {
    console.error('Failed to fetch Miden transactions:', error);
    return { txs: [], totalPages: 1, error: true };
  }
};

const getMidenTxByHash = async (
  txId: string,
): Promise<{ status: TxStatus; data: MidenTxDetail } | null> => {
  const tx = await midenIndexer.getTransaction(txId, { cache: 'no-store' }).catch(() => null);
  if (!tx) {
    return null;
  }
  return { status: 'confirmed', data: tx };
};

const getMidenTxMetrics = async (chainId: number): Promise<TxMetrics> => {
  const cached = await db.chainTxMetrics.findUnique({ where: { chainId } });

  if (!cached) {
    return { totalTxs: null, txsLast24h: null, txs30d: null, tps: null, avgFee: null };
  }

  return {
    totalTxs: cached.totalTxs ? Number(cached.totalTxs) : null,
    txsLast24h: cached.txsLast24h,
    txs30d: cached.txs30d,
    tps: cached.tps,
    avgFee: cached.avgFee,
  };
};
```

**Step 4: Wire into `getTxsByChainName`**

After the `logos-testnet` branch:
```ts
if (normalizedChainName === 'miden-testnet') {
  return getMidenTxs(currentPage, perPage);
}
```

**Step 5: Export**

Add to `TxService` object:
```ts
getMidenTxs,
getMidenTxByHash,
getMidenTxMetrics,
```

---

### Task 10: UI — Miden tx-detail rendering

**Files:**
- Create: `src/app/[locale]/networks/[name]/tx/[hash]/miden-tx-information.tsx`
- Modify: `src/app/[locale]/networks/[name]/tx/[hash]/tx-information.tsx`

**Step 1: Create `miden-tx-information.tsx`**

Follow the structure of `miden-block-information.tsx` (already in repo). Render fields:
- chain (link)
- block height (link to `/blocks/{block_num}`)
- timestamp (formatted)
- account id (bech32 + raw, copy buttons)
- init/final account state (hash row with CopyButton)
- input/output notes commitment (hash row)
- expiration block num (nullable)
- input nullifiers count + raw on hover (null-safe)
- output note ids count
- inserted at

**Step 2: Branch in `tx-information.tsx`**

Add after the cosmoshub branch, before the Aztec branch:
```tsx
if (chain?.name === 'miden-testnet') {
  return <MidenTxInformation chain={chain} hash={hash} />;
}
```

Import:
```ts
import MidenTxInformation from '@/app/networks/[name]/tx/[hash]/miden-tx-information';
```

---

### Task 11: Locale files (en/pt/ru)

**Files:**
- Modify: `messages/en.json`
- Modify: `messages/pt.json`
- Modify: `messages/ru.json`

**Step 1: Add new TxInformationPage keys**

For every new field rendered in `miden-tx-information.tsx` that isn't already in en.json:
- `account id`, `account id bech32`, `init account state`, `final account state`,
- `input notes commitment`, `output notes commitment`,
- `expiration block num`, `input nullifiers`, `output note ids`, `inserted at`

Add to all three locale files under `TxInformationPage` namespace with proper translations (en/pt/ru). Use existing wording style.

**Step 2: Verify symmetry**

Compare keys across en.json/pt.json/ru.json — every Miden key present in all three.

---

### Task 12: Verify tx list/metrics already render

**Files:**
- Read-only review:
  - `src/app/[locale]/networks/[name]/tx/txs-table/network-txs-list.tsx`
  - `src/app/[locale]/networks/[name]/tx/total-txs-metrics.tsx`
  - `src/app/[locale]/networks/[name]/(network-profile)/overview/network-overview.tsx`

**Step 1: Confirm generic dispatch**

`network-txs-list` calls `TxService.getTxsByChainName(chainName, …)` — after Task 9 this returns Miden data automatically. No edit needed.

`total-txs-metrics` reads `chainTxMetrics` via service — after `update-tx-metrics` cron runs for Miden, values populate. No edit needed.

`network-overview` already has generic tx-metrics block (from commit 96c6dbb). Verify `miden-testnet` not excluded by any chain-name check.

**Step 2: If gated by chain-name allowlist** — add `'miden-testnet'`.

---

### Task 13: Verify `update-tx-metrics` job runs for Miden

**Files:**
- Read: `server/jobs/update-tx-metrics.ts`

**Step 1: Ensure no chain-name allowlist excludes Miden**

`update-tx-metrics` should run for any chain where `chainMethods[name].getTotalTxs` exists. After Task 8, Miden qualifies. If the job has a hardcoded allowlist of chain names, add `'miden-testnet'`.

**Step 2: Manual trigger to populate metrics**

```bash
docker exec validatorinfo-dev-indexer npx tsx -e "
import updateTxMetrics from './server/jobs/update-tx-metrics.js';
await updateTxMetrics();
process.exit(0);
"
```

Then check:
```bash
docker exec validatorinfo-dev-db psql -U validatorinfo_user validatorinfo_db -c \
  "SELECT \"chainId\", \"totalTxs\", tps, \"txsLast24h\" FROM \"ChainTxMetrics\" WHERE \"chainId\" = (SELECT id FROM \"Chain\" WHERE name='miden-testnet');"
```

---

### Task 14: yarn lint + yarn build (lead-only)

Run:
```bash
yarn lint
yarn build
```

Fix any errors. **Do not commit** — leave working-tree changes for user review.

---

### Task 15: Manual UI verification

**Step 1: Start frontend** (already running).

**Step 2: Visit pages**

- `http://localhost:3000/networks/miden-testnet/tx` — list shows real tx_ids, blocks, accounts
- `http://localhost:3000/networks/miden-testnet/tx/<tx_id>` — detail page renders all fields
- `http://localhost:3000/networks/miden-testnet/overview` — total tx, tps, txsLast24h populated (after Task 13 cron)

**Step 3: Spot-check formatting**

- account_id_bech32 truncation
- block_num link works
- locales switch correctly (try `?locale=ru`, `?locale=pt`)

---

## Out of scope (file separately)

- Indexer-side bugs (`last_block` type drift, lex sort on `block_num`).
- Per-tx fee semantics (Miden v1 has no tx-level fee in indexer schema).
- Account detail page for Miden accounts (`/networks/miden-testnet/address/...`).
- `nullTxMetrics` cleanup (still used by other chains).

---

## File ownership matrix (for team execution)

| Teammate | Owns | Does NOT touch |
|---|---|---|
| backend-dev | `server/tools/chains/miden-testnet/*`, `src/app/services/miden-indexer-api/*`, `src/app/services/tx-service.ts` | UI components, locale files |
| frontend-dev | `src/app/[locale]/networks/[name]/tx/[hash]/miden-tx-information.tsx`, `tx-information.tsx` branch only | server/, services/ |
| i18n-dev | `messages/en.json`, `messages/pt.json`, `messages/ru.json` | code files |
| qa-dev | Manual UI verification, indexer job trigger | implementation files |

Sequential gates:
- Tasks 2 → 3 (types before endpoints)
- Tasks 4-7 (all four chain methods) → 8 (wire methods.ts) → 9 (tx-service)
- Tasks 9 + 11 → 10 (tx-information needs both service + locale keys)
- Task 14 (build/lint) gates Task 15 (manual UI)
