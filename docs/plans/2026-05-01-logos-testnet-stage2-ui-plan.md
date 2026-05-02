# Logos Testnet UI (Stage 2) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Wire up `/networks/logos-testnet` UI by reusing existing Aztec patterns: a typed REST client module for the citizenweb3 Logos indexer, plus minimal chain-aware branches in shared services and components.

**Architecture:** Mirror the `aztec-indexer-api` module 1:1 (`client.ts` + `endpoints.ts` + `types.ts` + `index.ts`) for Logos. Reuse the existing `/networks/[name]/blocks` route by adding a `getLogosBlocks` branch in `blocks-service.ts`. Reuse the existing `/networks/[name]/blocks/[hash]` route by extracting the Aztec block-information panel and adding a sibling `LogosBlockInformation` panel selected by chain name. Reuse the network overview by adding an `isLogos` branch that surfaces `total amount of blocks` (= `chain.uptimeHeight`, already populated by Stage 1's `getChainUptime`) and `average block time` (already populated via `chain.avgTxInterval`).

**Tech Stack:** Next.js 14 App Router, React Server Components, TypeScript, Tailwind, next-intl, Prisma. No new libraries.

**Out of scope (decided):** stats card with `total_blocks/finalized_blocks/leaders_count/lag_slots`, custom privacy disclosure panel, transaction-related rows. Reasons: total_blocks already covered by overview; finalized_blocks redundant once `/blocks` shows finalization column; leaders_count is one-time-per-block (=block count, useless); lag_slots is internal indexer metric; tx_count is always 0 on testnet.

**Project conventions to honor:**
- Localized strings: never hardcode user-facing text; add to all three of `messages/en.json`, `messages/pt.json`, `messages/ru.json` under existing namespaces.
- Tailwind only — no custom CSS or `<style>` tags. Use only the project's custom palette colors (per memory `feedback_tailwind_colors`).
- The user reviews diffs themselves — **DO NOT run `git commit`** during feature work (per memory `feedback_no_commits_user_reviews`). The "commit" steps below mean "stop, let the user review the diff."
- `yarn build` / `yarn lint` are run only by the tech lead, not by spawned agents (per memory `feedback_yarn_build_techlead_only`).

**Verified Logos indexer API surface (curl-confirmed 2026-05-01, host `https://indexer.testnet-logos.citizenweb3.com`, Bearer auth):**

- `GET /api/v1/stats` → `LogosStats` (already typed in `server/tools/chains/logos-testnet/types.ts`).
- `GET /api/v1/blocks?finalized=all&limit=N&offset=M` → `{ data: LogosBlock[], pagination: { limit, offset, has_more } }`. `LogosBlock` fields:
  - `id: string` (block hash, 64 hex chars — used as URL `[hash]`)
  - `parent_block: string`
  - `slot: number`
  - `height: number | null` (null until finalized)
  - `block_root: string`
  - `leader_key: string` (one-time, privacy)
  - `voucher_cm: string`
  - `entropy: string`
  - `tx_count: number` (always 0 on testnet)
  - `finalized: boolean`
  - `indexed_at: string` (ISO timestamp from indexer; **note:** this is when our indexer ingested it, not block production time — the chain itself does not currently expose block timestamps)
- `GET /api/v1/blocks/:id` → single `LogosBlock` plus `raw: { header: { proof_of_leadership: { proof: number[], leader_key, voucher_cm, entropy_contribution }, ... }, transactions: [] }`. We display the flat fields; `raw` is intentionally not surfaced (huge byte array, no user value).

---

## Task 0: Pre-flight (tech lead, 1 minute)

Confirm Stage 1 is still functional before extending it.

**Command:**
```bash
docker exec validatorinfo-dev-db psql -U validatorinfo_user validatorinfo_db -c "SELECT name, supported, uptime_height FROM chains WHERE name = 'logos-testnet';"
```

**Expected:** one row, `supported=t`, `uptime_height > 0`. If `uptime_height = 0`, Stage 1 is broken — fix it before proceeding (see `docs/plans/2026-05-01-logos-testnet-stage1-plan.md`).

---

## Task 1: Create `logos-indexer-api/types.ts`

**Files:**
- Create: `src/app/services/logos-indexer-api/types.ts`

**Why this task:** Types come first so subsequent tasks (client, endpoints, callers) can import without churn. We mirror the Aztec module's `types.ts` shape.

**Step 1: Read the reference file** so the new types follow the same conventions.

Read: `src/app/services/aztec-indexer-api/types.ts` (lines 1–60: `AztecIndexerRequestOptions`, the request-options shape we will replicate).

**Step 2: Write the file**

```ts
// src/app/services/logos-indexer-api/types.ts

export interface LogosIndexerRequestOptions {
  cache?: RequestCache;
  revalidate?: number | false;
  tags?: string[];
  timeout?: number;
  signal?: AbortSignal;
  headers?: HeadersInit;
}

export interface LogosStats {
  total_blocks: number;
  finalized_blocks: number;
  latest_slot: number;
  latest_height: number | null;
  leaders_count: number;
  last_indexed_slot: number;
  node_tip_slot: number;
  node_height: number;
  node_mode: 'Online' | 'Syncing' | string;
  lag_slots: number;
}

export interface LogosBlock {
  id: string;
  parent_block: string;
  slot: number;
  height: number | null;
  block_root: string;
  leader_key: string;
  voucher_cm: string;
  entropy: string;
  tx_count: number;
  finalized: boolean;
  indexed_at: string;
  raw?: LogosBlockRaw;
}

export interface LogosBlockRaw {
  header: {
    id: string;
    slot: number;
    block_root: string;
    parent_block: string;
    proof_of_leadership: {
      proof: number[];
      leader_key: string;
      voucher_cm: string;
      entropy_contribution: string;
    };
  };
  transactions: unknown[];
}

export interface LogosBlocksPagination {
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface LogosBlocksResponse {
  data: LogosBlock[];
  pagination: LogosBlocksPagination;
}
```

**Step 3: Stop and let the user review.**

The user will look at the diff and either accept or ask for changes. Do not run `git commit`.

---

## Task 2: Create `logos-indexer-api/client.ts`

**Files:**
- Create: `src/app/services/logos-indexer-api/client.ts`

**Why this task:** Generic HTTP layer — Bearer auth, timeout, JSON parse, query-string builder. Copy of Aztec client with renamed env vars and logger name. Keeping the structure identical means future fixes can be ported across both modules without translation.

**Step 1: Read the reference file**

Read: `src/app/services/aztec-indexer-api/client.ts` (full file, ~219 lines).

**Step 2: Write the file**

Copy the Aztec client verbatim with these substitutions:
- `AZTEC_INDEXER_BASE_URL` → `LOGOS_INDEXER_BASE_URL`
- `AZTEC_INDEXER_API_TOKEN` → `LOGOS_INDEXER_API_TOKEN`
- `aztec-indexer-client` (logger name) → `logos-indexer-client`
- `AztecIndexerRequestOptions` → `LogosIndexerRequestOptions`

Everything else (timeout default, query-string serializer, `safeJsonParse`, `request`, exported `get`/`post`/`healthCheck`/`getBaseUrl`) stays byte-for-byte identical.

**Step 3: Stop and let the user review.**

---

## Task 3: Create `logos-indexer-api/endpoints.ts`

**Files:**
- Create: `src/app/services/logos-indexer-api/endpoints.ts`

**Why this task:** Typed accessors for the three endpoints we actually use. Resist the urge to mirror Aztec's full ~22KB endpoint surface — Logos exposes far less. YAGNI.

**Step 1: Write the file**

```ts
// src/app/services/logos-indexer-api/endpoints.ts

import * as client from './client';
import {
  LogosBlock,
  LogosBlocksResponse,
  LogosIndexerRequestOptions,
  LogosStats,
} from './types';

export const getStats = (options?: LogosIndexerRequestOptions): Promise<LogosStats> =>
  client.get<LogosStats>('/api/v1/stats', null, options);

export interface GetBlocksParams {
  finalized?: 'true' | 'false' | 'all';
  limit?: number;
  offset?: number;
}

export const getBlocks = (
  params: GetBlocksParams = {},
  options?: LogosIndexerRequestOptions,
): Promise<LogosBlocksResponse> =>
  client.get<LogosBlocksResponse>(
    '/api/v1/blocks',
    {
      finalized: params.finalized ?? 'all',
      limit: params.limit,
      offset: params.offset,
    },
    options,
  );

export const getBlock = async (
  id: string,
  options?: LogosIndexerRequestOptions,
): Promise<LogosBlock | null> => {
  try {
    return await client.get<LogosBlock>(`/api/v1/blocks/${id}`, null, options);
  } catch (e) {
    // Indexer returns 404 for unknown ids — surface as null so callers can `notFound()`.
    if (e instanceof Error && e.message.includes('HTTP 404')) {
      return null;
    }
    throw e;
  }
};
```

**Step 2: Stop and let the user review.**

---

## Task 4: Create `logos-indexer-api/index.ts` (facade)

**Files:**
- Create: `src/app/services/logos-indexer-api/index.ts`

**Why this task:** Single import surface — callers do `import logosIndexer from '@/services/logos-indexer-api'`, never `from '.../endpoints'`. This is the same pattern Aztec uses.

**Step 1: Read the reference file**

Read: `src/app/services/aztec-indexer-api/index.ts` (full file).

**Step 2: Write the file**

```ts
// src/app/services/logos-indexer-api/index.ts

import { getBaseUrl, healthCheck } from './client';
import { getBlock, getBlocks, getStats } from './endpoints';

export * from './types';

export const logosIndexer = {
  getStats,
  getBlocks,
  getBlock,
  healthCheck,
  getBaseUrl,
};

export default logosIndexer;
```

**Step 3: Stop and let the user review.**

---

## Task 5: Wire env vars

**Files:**
- Modify: `.env.example` (Logos Testnet section)
- Modify: `.env` (local — only if smoke-testing)
- Modify: `docker-compose.dev.yml` (frontend service env, only if value not auto-loaded from `env_file: .env`)

**Step 1: Inspect**

Read: `.env.example` (Logos Testnet section, around line 95–101). Verify `LOGOS_INDEXER_API_TOKEN` is present from Stage 1.

**Step 2: Add base URL**

Modify `.env.example`:

```diff
 # ============================================
 # Logos Testnet
 # ============================================

+# Base URL for citizenweb3 Logos indexer (server- and client-side)
+LOGOS_INDEXER_BASE_URL="https://indexer.testnet-logos.citizenweb3.com"
+
 # Bearer token for citizenweb3 Logos indexer (...)
 # Required for getChainUptime to fetch /api/v1/stats. ...
 LOGOS_INDEXER_API_TOKEN=""
```

**Step 3: Mirror in local `.env`** (only the URL — token is already there from Stage 1):

```
LOGOS_INDEXER_BASE_URL="https://indexer.testnet-logos.citizenweb3.com"
```

**Step 4: Verify docker-compose loads it.**

Inspect `docker-compose.dev.yml` for the `frontend` service. It uses `env_file: - .env`, so any var in `.env` is auto-loaded — no compose change needed. If frontend is later configured with explicit `environment:` overrides, add `LOGOS_INDEXER_BASE_URL: ${LOGOS_INDEXER_BASE_URL}` there too.

**Step 5: Stop and let the user review.**

---

## Task 6: Add `getLogosBlocks` branch in `blocks-service.ts`

**Files:**
- Modify: `src/app/services/blocks-service.ts:1-76`

**Why this task:** The shared route `/networks/[name]/blocks` already calls `BlocksService.getBlocksByChainName(name, page, perPage)`. Adding a Logos branch lights up the page with zero route changes.

**Step 1: Read the reference function**

Read: `src/app/services/blocks-service.ts` (full file, currently has only `getAztecBlocks` and a `getBlocksByChainName` switch).

**Step 2: Add `getLogosBlocks` adjacent to `getAztecBlocks`**

```ts
import logosIndexer from '@/services/logos-indexer-api';
// (keep the existing aztec imports above)

const LOGOS_MAX_PER_PAGE = 100;

const getLogosBlocks = async (currentPage: number, perPage: number): Promise<BlocksResponse> => {
  try {
    const pageSize = Math.max(1, Math.min(perPage, LOGOS_MAX_PER_PAGE));
    const stats = await logosIndexer.getStats({ cache: 'no-store' });
    const totalBlocks = stats.total_blocks;

    if (!totalBlocks || totalBlocks <= 0) {
      return { blocks: [], totalPages: 1 };
    }

    const totalPages = Math.max(1, Math.ceil(totalBlocks / pageSize));
    const offset = (currentPage - 1) * pageSize;
    const { data } = await logosIndexer.getBlocks(
      { finalized: 'all', limit: pageSize, offset },
      { cache: 'no-store' },
    );

    const blocks: BlockItem[] = data.map((b) => ({
      hash: b.id,
      // height is null until finalization on Cryptarchia — fall back to slot so the
      // column is never empty (slot is unique-and-monotonic per block).
      height: b.height ?? b.slot,
      timestamp: formatTimestamp(new Date(b.indexed_at)),
      finalizationStatus: b.finalized ? 1 : 0,
    }));

    return { blocks, totalPages };
  } catch (error) {
    console.error('Failed to fetch Logos blocks:', error);
    return { blocks: [], totalPages: 1 };
  }
};
```

**Step 3: Wire the branch into `getBlocksByChainName`**

```diff
 const getBlocksByChainName = async (
   chainName: string,
   currentPage: number = 1,
   perPage: number = 10,
 ): Promise<BlocksResponse> => {
   const normalizedChainName = chainName.toLowerCase();

   if (normalizedChainName === 'aztec') {
     return getAztecBlocks(currentPage, perPage);
   }
+
+  if (normalizedChainName === 'logos-testnet') {
+    return getLogosBlocks(currentPage, perPage);
+  }

   return { blocks: [], totalPages: 1 };
 };
```

**Step 4: Update the existing "Under Development" guard**

`src/app/[locale]/networks/[name]/blocks/blocks-table/network-blocks-list.tsx:16` currently reads:

```ts
if (blocks.length === 0 && name.toLowerCase() !== 'aztec') {
  // shows "Under Development"
}
```

Change to also exclude `logos-testnet`:

```ts
const supportsBlocks = ['aztec', 'logos-testnet'].includes(name.toLowerCase());
if (blocks.length === 0 && !supportsBlocks) {
  // shows "Under Development"
}
```

**Step 5: Manual smoke test**

Open `http://localhost:3000/en/networks/logos-testnet/blocks`. Expect: a paginated table of recent blocks. `Block Height` column shows slot numbers (since chain `height` is mostly null). Status column shows finalized/pending pills.

**Step 6: Stop and let the user review.**

---

## Task 7: Create `LogosBlockInformation` component

**Files:**
- Create: `src/app/[locale]/networks/[name]/blocks/[hash]/logos-block-information.tsx`

**Why this task:** The existing `block-information.tsx` is Aztec-shaped (uses `block.body.txEffects`, `block.header.globalVariables`, …). We add a sibling component instead of branching that file inline because the field sets diverge significantly and a single function with two unrelated shapes would be a mess.

**Step 1: Read the reference component**

Read: `src/app/[locale]/networks/[name]/blocks/[hash]/block-information.tsx` (full file). Note the visual structure: hero panel (icon + status pill + block height pill + hash) and a stack of `<div className="mt-2 flex w-full hover:bg-bgHover">` rows.

**Step 2: Write the file** — same Tailwind classes and structure, Logos-specific data:

```tsx
// src/app/[locale]/networks/[name]/blocks/[hash]/logos-block-information.tsx

import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { FC } from 'react';

import CopyButton from '@/components/common/copy-button';
import RoundedButton from '@/components/common/rounded-button';
import Tooltip from '@/components/common/tooltip';
import logosIndexer from '@/services/logos-indexer-api';
import { ChainWithParams } from '@/services/chain-service';

interface OwnProps {
  chain: ChainWithParams | null;
  hash: string;
}

const LogosBlockInformation: FC<OwnProps> = async ({ chain, hash }) => {
  const t = await getTranslations('BlockInformationPage');

  let block;
  try {
    block = await logosIndexer.getBlock(hash, { revalidate: false });
  } catch (error) {
    console.error('Error fetching Logos block:', error);
    notFound();
  }

  if (!block) {
    notFound();
  }

  const indexedAt = new Date(block.indexed_at);
  const formattedTimestamp = indexedAt.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC');
  const finalizationLabel = block.finalized ? 'finalized' : 'pending';
  const heightLabel = block.height ?? `slot ${block.slot}`;

  const blockData: Array<{ title: string; data: string | number }> = [
    { title: 'block hash', data: block.id },
    { title: 'slot number', data: block.slot },
    { title: 'block height', data: block.height ?? '—' },
    { title: 'parent block', data: block.parent_block },
    { title: 'finalization status', data: finalizationLabel },
    { title: 'transaction count', data: block.tx_count },
    { title: 'leader key', data: block.leader_key },
    { title: 'voucher commitment', data: block.voucher_cm },
    { title: 'entropy', data: block.entropy },
    { title: 'block root', data: block.block_root },
    { title: 'indexed at', data: formattedTimestamp },
  ];

  const renderValue = (title: string, data: string | number) => {
    const isHash =
      title === 'block hash' ||
      title === 'parent block' ||
      title === 'leader key' ||
      title === 'voucher commitment' ||
      title === 'entropy' ||
      title === 'block root';

    if (title === 'finalization status') {
      return (
        <div className="flex items-center gap-2">
          <div
            className={`rounded-full px-6 py-1 font-handjet text-lg shadow-button ${
              data === 'finalized' ? 'bg-primary' : 'bg-secondary'
            }`}
          >
            {t(data as 'finalized' | 'pending')}
          </div>
        </div>
      );
    }

    if (isHash && typeof data === 'string') {
      return (
        <div className="flex items-center gap-2">
          <span className="break-all font-handjet text-lg">{data}</span>
          <CopyButton value={data} />
        </div>
      );
    }

    return <div className="font-handjet text-lg">{data}</div>;
  };

  return (
    <div className="mt-2">
      <div className="mb-8 ml-5 flex justify-between">
        <div className="flex flex-row">
          <div className="mr-5 flex">
            <Tooltip tooltip={t('block icon tooltip')} direction={'bottom'}>
              <div className="h-24 min-h-24 w-24 min-w-24 bg-hash_txs bg-contain bg-no-repeat hover:bg-hash_txs_h" />
            </Tooltip>
          </div>
          <div className="flex flex-col justify-center">
            <div className="mb-1 flex flex-row text-center font-handjet text-lg">
              <div
                className={`mr-6 rounded-full px-6 shadow-button ${
                  block.finalized ? 'bg-primary' : 'bg-secondary'
                }`}
              >
                {t(finalizationLabel as 'finalized' | 'pending')}
              </div>
              <div className="rounded-full bg-secondary px-6 shadow-button">
                {t('block')} #{heightLabel}
              </div>
            </div>
            <div className="flex items-end justify-end font-handjet text-lg">
              {block.id}
              <CopyButton value={block.id} size="md" />
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <RoundedButton href={`/networks/${chain?.name}/blocks`} className="mb-4 font-handjet text-lg active:mb-3">
            {t('show all blocks')}
          </RoundedButton>
        </div>
      </div>
      {blockData.map((item) => (
        <div key={item.title} className="mt-2 flex w-full hover:bg-bgHover">
          <div className="w-3/12 items-center border-b border-r border-bgSt py-4 pl-11 font-sfpro text-lg">
            {t(item.title as 'block hash')}
          </div>
          <div className="flex w-9/12 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-sfpro text-base hover:text-highlight">
            {renderValue(item.title, item.data)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LogosBlockInformation;
```

**Step 3: Stop and let the user review.**

---

## Task 8: Make `block-information.tsx` chain-aware

**Files:**
- Modify: `src/app/[locale]/networks/[name]/blocks/[hash]/block-information.tsx`

**Why this task:** The layout currently renders `<BlockInformation chain={chain} hash={hash} />` for every chain. We delegate to `LogosBlockInformation` when `chain.name === 'logos-testnet'` and otherwise keep the existing Aztec rendering untouched.

**Step 1: Inspect**

Read: `src/app/[locale]/networks/[name]/blocks/[hash]/block-information.tsx:1-30` (the imports + signature).

**Step 2: Add the early return at the top of the component body**

```diff
 import { aztecIndexer } from '@/services/aztec-indexer-api';
 import { ChainWithParams } from '@/services/chain-service';
 import { getAztecBlockHeight, getAztecFinalizationLabel, getAztecTimestampMs } from '@/utils/aztec';
+import LogosBlockInformation from '@/app/networks/[name]/blocks/[hash]/logos-block-information';

 interface OwnProps {
   chain: ChainWithParams | null;
   hash: string;
 }

 const BlockInformation: FC<OwnProps> = async ({ chain, hash }) => {
+  if (chain?.name === 'logos-testnet') {
+    return <LogosBlockInformation chain={chain} hash={hash} />;
+  }
+
   const t = await getTranslations('BlockInformationPage');
   const isHeight = /^\d+$/.test(hash);
   // ... rest unchanged
```

**Step 3: Manual smoke test**

Open `http://localhost:3000/en/networks/logos-testnet/blocks`, click any block hash. Expect: Logos-specific detail page with `slot number`, `leader key`, `voucher commitment`, `entropy`, `block root`. No Aztec-only fields visible.

**Step 4: Stop and let the user review.**

---

## Task 9: Add `isLogos` overview block

**Files:**
- Modify: `src/app/[locale]/networks/[name]/(network-profile)/overview/network-overview.tsx`

**Why this task:** The dedicated network overview page is mostly empty for Logos — we have `chain.uptimeHeight` (= node block count, populated by Stage 1's `getChainUptime`) and `chain.avgTxInterval` (slot duration, also Stage 1) but nothing yet renders them as a Logos-shaped row.

**Step 1: Inspect**

Read: `src/app/[locale]/networks/[name]/(network-profile)/overview/network-overview.tsx:88-280` (the whole component body to see existing structure and the Aztec branch).

**Step 2: Add an `isLogos` block beside the `isAztec` branch**

After the existing `isAztec` early-detection line:

```diff
   const isAztec = chain?.name === 'aztec' || chain?.name === 'aztec-testnet';
+  const isLogos = chain?.name === 'logos-testnet';
```

Inside the Aztec/non-Aztec rendering at the bottom (current structure: `{isAztec && chain ? (...) : (!!chain?.avgTxInterval && ...)}`), expand to a 3-way:

```tsx
{isAztec && chain ? (
  <>
    {/* unchanged Aztec branch */}
  </>
) : isLogos && chain ? (
  <>
    {!!chain.uptimeHeight && (
      <div className="mt-2 flex w-full bg-table_row hover:bg-bgHover">
        <div className="w-1/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
          {t('total amount of blocks')}
        </div>
        <Link
          href={`/networks/${chain.name}/blocks`}
          className="flex w-2/3 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg hover:text-highlight hover:underline"
        >
          {chain.uptimeHeight.toLocaleString('en-US')}
        </Link>
      </div>
    )}
    {!!chain.avgTxInterval && (
      <div className="mt-2 flex w-full bg-table_row hover:bg-bgHover">
        <div className="w-1/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
          {t('slot duration')}
        </div>
        <div className="flex w-2/3 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg hover:text-highlight">
          {(chain.avgTxInterval / 1000).toFixed(2)}s
        </div>
      </div>
    )}
  </>
) : (
  !!chain?.avgTxInterval && (
    <div className="mt-2 flex w-full bg-table_row hover:bg-bgHover">
      <div className="w-1/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg ">
        {t('average block time')}
      </div>
      <div className="flex w-2/3 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg hover:text-highlight">
        {chain.avgTxInterval.toFixed(2)}s
      </div>
    </div>
  )
)}
```

**Note on the unit:** `chain.avgTxInterval` is stored in **milliseconds** (Stage 1 set it to `2000`), but the existing non-Aztec branch renders it raw with an `s` suffix — which is a pre-existing bug for any chain with a ms-based interval. For Logos we explicitly divide by 1000 and reuse the `slot duration` label that Aztec uses. Do not "fix" the non-Aztec branch in this PR — out of scope.

**Step 3: Manual smoke test**

Open `http://localhost:3000/en/networks/logos-testnet/overview`. Expect at minimum: `total amount of blocks` row (linked to `/blocks`) and `slot duration: 2.00s` row.

**Step 4: Stop and let the user review.**

---

## Task 10: Localization

**Files:**
- Modify: `messages/en.json`, `messages/pt.json`, `messages/ru.json`

**Why this task:** Per CLAUDE.md, every user-facing string must exist in all three locale files under the same key path.

**Step 1: Audit**

Search for the keys we used in Tasks 7 and 9: `BlockInformationPage` namespace — `block hash`, `block height`, `slot number`, `parent block`, `finalization status`, `transaction count`, `block root`, `block icon tooltip`, `show all blocks`, `block`, `finalized`, `pending`, `title`, `description` — **most are already present** (Aztec uses them). Only the new ones need to be added: `leader key`, `voucher commitment`, `entropy`, `parent block`, `indexed at`. `NetworkPassport` namespace — `total amount of blocks`, `slot duration` — also already present.

Run grep to confirm before editing:
```bash
grep -E '"(leader key|voucher commitment|entropy|parent block|indexed at)"' /Users/user/project/dev/validatorinfo/messages/en.json
```

**Step 2: Add missing keys to all three files**

In each of `messages/{en,pt,ru}.json` under `BlockInformationPage`:

```jsonc
// en.json
"leader key": "leader key",
"voucher commitment": "voucher commitment",
"entropy": "entropy",
"parent block": "parent block",
"indexed at": "indexed at",
```

```jsonc
// pt.json
"leader key": "chave do líder",
"voucher commitment": "compromisso do voucher",
"entropy": "entropia",
"parent block": "bloco pai",
"indexed at": "indexado em",
```

```jsonc
// ru.json
"leader key": "leader key",
"voucher commitment": "voucher commitment",
"entropy": "entropy",
"parent block": "родительский блок",
"indexed at": "проиндексирован",
```

(Cryptography-specific terms like `leader key`, `voucher commitment`, `entropy` keep English form in `ru.json` — domain convention in this project for Cryptarchia/ZK terminology that has no settled Russian translation.)

**Step 3: Stop and let the user review.**

---

## Task 11: Tech-lead verification + smoke test

**Tech lead actions only.**

**Step 1:** `yarn lint` — must pass with no new warnings on touched files.

**Step 2:** `yarn build` — must compile without TypeScript errors.

**Step 3:** Rebuild frontend, restart:

```bash
docker compose -f docker-compose.dev.yml build frontend
docker compose -f docker-compose.dev.yml up -d frontend
```

**Step 4: Browse the three pages** at `http://localhost:3000/en/networks/logos-testnet/`:

| URL | Expected |
|---|---|
| `/overview` | Shows at least: `total amount of blocks` (linked) and `slot duration: 2.00s`. |
| `/blocks` | Paginated list (20/page default). Status column has finalized/pending pills. Block height column shows slot numbers (since `height` is mostly null for Cryptarchia). |
| `/blocks/<id>` (click any block) | Logos-specific detail page with `slot number`, `leader key`, `voucher commitment`, `entropy`, `block root`. No `total fees` / `total mana used` / `block producer` rows (Aztec-only). |

**Step 5: Stop and report.**

---

## Done criteria

1. `/networks/logos-testnet/overview` shows total blocks + slot duration without "Under Development" placeholders.
2. `/networks/logos-testnet/blocks` paginates real indexer data.
3. `/networks/logos-testnet/blocks/<id>` renders Logos-specific fields, no Aztec fields leak in.
4. `yarn build` and `yarn lint` clean.
5. All three locale files contain the new keys.
6. No `git commit` made — user reviews the full diff and decides.
7. Stage-1 smoke-test config (`server/indexer.ts` task list, `server/tools/chains/chains.ts` `includeChains`, optional smoke token in `.env`) reverted before final review (separate cleanup, tracked in Stage 1 plan).

## Out-of-scope follow-ups (not part of this plan)

- Fix ms-vs-s unit mismatch in the non-Aztec `average block time` overview row.
- Surface Logos `tx_count > 0` if/when the testnet starts producing real transactions.
- Use the new client to populate richer chain methods (e.g., `getStakingPool` analogue, `getProposals`) if Logos ever adds attributable validators or governance.
- Add a "raw block JSON" expand panel in `[hash]/expand/` route — already a placeholder folder, but not needed at this stage.
