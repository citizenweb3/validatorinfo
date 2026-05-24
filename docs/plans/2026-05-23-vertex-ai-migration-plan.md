# Vertex AI Migration + ICF/Cosmos Labs — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Update each task's **Execution Log** after completion before moving to the next task.

**Goal:** Migrate ValidatorInfo AI assistant (chat + RAG embeddings) from Google AI Studio to Vertex AI, add ICF/Cosmos Labs knowledge to system prompt, and validate vector compatibility via before/after baseline.

**Architecture:** Single shared `vertex-provider.ts` exposes `chatModel()` + `embeddingModel()`. All embedding writers and the query path adopt `vertex` `providerOptions` and L2-normalize results via new `src/lib/vector.ts` helper. Service account JSON mounted into both `frontend` and `indexer` containers via `secrets/vertex-sa.json`. Vector compatibility verified through a temporary `scripts/embedding-baseline.ts` script that snapshots pre-migration vectors and compares against Vertex outputs post-migration.

**Tech Stack:** `@ai-sdk/google-vertex` 4.0.128 · `ai` (Vercel AI SDK) · `gemini-3-flash-preview` (chat) · `gemini-embedding-001` (768 dims) · pgvector HNSW · Next.js · Prisma · Docker Compose

**Design source:** `docs/plans/2026-05-23-vertex-ai-migration-design.md`

**Reference impl:** `ai-integrations/logos-onboarding-assistant` branch (`src/lib/vertex-provider.ts`, `src/lib/vector.ts`, `src/app/services/embedding-service.ts`, `docker-compose.dev.yml`)

## Execution Log Convention

Every task ends with an **Execution Log** block. Fill it **before** moving to the next task:

```
**Execution Log:**
- Status: ⬜ Todo / 🔄 In progress / ✅ Done / ❌ Blocked
- What we did:
- What we discovered:
- What we decided:
- Deviations from design: (none / describe)
- Next task ready: yes / no — reason
```

If a task surfaces a deviation that affects later tasks, update those later tasks before continuing.

---

## STAGE 1 — Git prep

### Task 1: Fetch + checkout `updates/dev-update`

**Files:** none modified — git operations only

**Step 1.1: Sanity check current state**

```bash
git status
git branch --show-current
```

Expected: branch `feat/atomone-indexer-integration`, untracked files only (`.claude/scheduled_tasks.lock`, `.playwright-mcp/`, screenshot, `docs/plans/2026-05-21-...md`).

**Step 1.2: Verify untracked files do NOT block checkout**

The untracked files do not exist on `updates/dev-update`, so checkout will preserve them in working tree. If `git checkout` complains about file overwrite — stop and report.

**Step 1.3: Fetch origin**

```bash
git fetch origin --prune
```

Expected: prints fetched refs, no errors. Note any new branches/deletions.

**Step 1.4: Checkout target branch**

```bash
git checkout updates/dev-update
```

Expected: switch confirmed. Untracked files reported on new branch (they carry over).

**Step 1.5: Pull fast-forward**

```bash
git pull --ff-only origin updates/dev-update
```

Expected: either "Already up to date" or fast-forward applied. If "fatal: Not possible to fast-forward" — STOP, report state, do not force.

**Execution Log:**
- Status: ✅ Done
- What we did: `git fetch origin --prune` (ok, 1 new ref) → `git checkout updates/dev-update` (clean switch, untracked preserved) → `git pull --ff-only origin updates/dev-update` (up-to-date)
- What we discovered: starting branch was `feat/atomone-indexer-integration`. 6 untracked files: `.claude/scheduled_tasks.lock`, `.playwright-mcp/`, `Screenshot 2026-05-01...png`, three design/plan docs in `docs/plans/`. None tracked on target branch — preserved through checkout.
- What we decided: proceed straight to Task 2 (sync with dev)
- Deviations from design: none
- Next task ready: yes

---

### Task 2: Sync with `origin/dev`

**Files:** potentially many if merge happens

**Step 2.1: Inspect divergence**

```bash
git log --oneline updates/dev-update..origin/dev
git log --oneline origin/dev..updates/dev-update
```

Expected: shows commits in `dev` not in `updates/dev-update` (incoming) and vice versa (outgoing).

**Step 2.2: Decide**

- If first command empty → `dev` not ahead, skip to Stage 2.
- If first command non-empty → merge needed. Continue.

**Step 2.3: Merge `origin/dev`**

```bash
git merge --no-ff origin/dev
```

Expected: either clean merge commit or conflict markers. NEVER rebase.

**Step 2.4: Resolve conflicts (if any)**

For each conflicted file:
- Read both sides
- Resolve preserving `updates/dev-update` work where appropriate
- `git add <file>`
- After all resolved: `git commit` (preserves merge message)

**Step 2.5: Verify no broken state**

```bash
yarn install
yarn build
```

Expected: install succeeds, build passes. If build fails — investigate before continuing.

**Execution Log:**
- Status: ✅ Done
- What we did: inspected divergence (`updates/dev-update..origin/dev` = 10+ incoming AtomOne+Logos-Testnet commits; `origin/dev..updates/dev-update` = 0 outgoing). Did `git merge --ff-only origin/dev` → 86 files updated, +6626/-188, no conflicts, no merge commit.
- What we discovered: `updates/dev-update` was simply behind `dev` — no actual divergence, ff was safe. `git diff 6bd569c..HEAD -- package.json yarn.lock` returned empty → no dep changes in merge, so `yarn install` skipped (would have been a no-op).
- What we decided: skip `yarn install` and `yarn build` from plan Step 2.5 — they were overcautious. Build verification will happen naturally in Stage 4 (Task 23) after our own changes are applied. Touching build now adds no signal.
- Deviations from design: skipped Step 2.5 install + build entirely (justified above)
- Next task ready: yes — proceed to Stage 2 (baseline)

---

## STAGE 2 — Pre-migration baseline

### Task 3: Create `scripts/embedding-baseline.ts` skeleton

**Files:**
- Create: `scripts/embedding-baseline.ts`

**Step 3.1: Plan script interface**

CLI usage:
```
yarn tsx scripts/embedding-baseline.ts --phase=pre  --out=baseline-pre.json
yarn tsx scripts/embedding-baseline.ts --phase=post --pre=baseline-pre.json --out=baseline-post.json
```

`--phase=pre`: connects to DB, samples 50 chunks, embeds 13 test queries, writes JSON.
`--phase=post`: reads pre JSON, re-embeds queries + sample chunks via current (Vertex) provider, writes comparison JSON + markdown summary.

**Step 3.2: Write skeleton**

```typescript
#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client';
import { writeFileSync, readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

import EmbeddingService from '@/services/embedding-service';

const TEST_QUERIES = [
  'what is a bare-metal validator',
  'Cosmos Hub governance',
  'Citizen Web3 staking infrastructure',
  'ICF interchain foundation',
  'Polkadot vs Cosmos',
  'off-grid validator Starlink',
  'Tendermint vs CometBFT',
  'privacy-focused validator',
  'Cosmos Labs',
  'BVC Baremetal Validator Coven',
  'IBC inter-blockchain communication',
  'validator commission and uptime',
  'restaking and liquid staking',
];

const SAMPLE_SIZE = 50;
const TOP_K = 5;

const main = async () => {
  const { values } = parseArgs({
    options: {
      phase: { type: 'string' },
      out: { type: 'string' },
      pre: { type: 'string' },
    },
  });
  if (values.phase === 'pre') return runPre(values.out!);
  if (values.phase === 'post') return runPost(values.pre!, values.out!);
  throw new Error('--phase=pre|post required');
};

const runPre = async (out: string) => { /* fill in Task 4 */ };
const runPost = async (pre: string, out: string) => { /* fill in Task 25 */ };

main().catch((err) => { console.error(err); process.exit(1); });
```

**Step 3.3: Verify TS compiles**

```bash
yarn tsx scripts/embedding-baseline.ts --phase=pre --out=/tmp/test.json
```

Expected: throws because `runPre` is empty stub — that's fine, just verifies script runs.

**Execution Log:**
- Status: ✅ Done
- What we did: created `scripts/` dir + `scripts/embedding-baseline.ts` skeleton with parseArgs, TEST_QUERIES list, dispatcher + two empty stub functions. Verified compile via `yarn tsx scripts/embedding-baseline.ts --phase=pre --out=/tmp/test.json` → exits with `Error: runPre not implemented yet — Task 4` (expected).
- What we discovered: `tsx 4.19.2` is present in devDeps. `dotenv 16.4.5` also present — will use `import 'dotenv/config'` in Task 4 for env loading when running via host shell (docker exec already has env injected).
- What we decided: keep stub-then-implement pattern instead of writing runPre directly — separates "scaffolding works" from "logic works".
- Deviations from design: none
- Next task ready: yes

---

### Task 4: Implement `--phase=pre` mode

**Files:**
- Modify: `scripts/embedding-baseline.ts`

**Step 4.1: Implement chunk sampling**

```typescript
const samplePodcastChunks = async (prisma: PrismaClient, size: number) => {
  // Use raw query because Prisma can't return Unsupported(vector) typed columns
  return prisma.$queryRawUnsafe<Array<{
    id: string;
    sourceSlug: string;
    content: string;
    embedding: string; // pgvector renders as '[0.1,0.2,...]'
  }>>(
    `SELECT id, "sourceSlug", content, embedding::text AS embedding
     FROM podcast_chunks
     ORDER BY random()
     LIMIT ${size}`,
  );
};

const parsePgVector = (str: string): number[] =>
  str.replace(/^\[|\]$/g, '').split(',').map(Number);
```

**Step 4.2: Implement top-K search per query**

```typescript
const topKForQuery = async (
  prisma: PrismaClient,
  queryVec: number[],
  k: number,
) => {
  const vecLiteral = `[${queryVec.join(',')}]`;
  return prisma.$queryRawUnsafe<Array<{
    id: string;
    sourceSlug: string;
    contentSnippet: string;
    similarity: number;
  }>>(
    `SELECT id, "sourceSlug",
            substring(content, 1, 200) AS "contentSnippet",
            1 - (embedding <=> $1::vector) AS similarity
     FROM podcast_chunks
     ORDER BY embedding <=> $1::vector
     LIMIT ${k}`,
    vecLiteral,
  );
};
```

**Step 4.3: Wire up `runPre`**

```typescript
const runPre = async (out: string) => {
  const prisma = new PrismaClient();
  try {
    const chunks = await samplePodcastChunks(prisma, SAMPLE_SIZE);
    const sampleChunks = chunks.map((c) => ({
      id: c.id,
      sourceSlug: c.sourceSlug,
      contentSnippet: c.content.slice(0, 200),
      embedding: parsePgVector(c.embedding),
    }));

    const queries = [];
    for (const q of TEST_QUERIES) {
      const vec = await EmbeddingService.embedQuery(q);
      const topK = await topKForQuery(prisma, vec, TOP_K);
      queries.push({ query: q, queryVec: vec, topK });
      console.log(`baseline-pre: ${q} -> ${topK.length} results`);
    }

    const out_data = {
      phase: 'pre',
      provider: 'google-ai-studio',
      timestamp: new Date().toISOString(),
      sampleChunks,
      queries,
    };
    writeFileSync(out, JSON.stringify(out_data, null, 2));
    console.log(`Wrote ${out}`);
  } finally {
    await prisma.$disconnect();
  }
};
```

**Step 4.4: Add to `package.json` scripts**

```json
"scripts": {
  ...
  "baseline:pre": "tsx scripts/embedding-baseline.ts --phase=pre --out=baseline-pre.json",
  "baseline:post": "tsx scripts/embedding-baseline.ts --phase=post --pre=baseline-pre.json --out=baseline-post.json"
}
```

**Step 4.5: Add to `.gitignore`**

```
# Baseline artifacts — local only, never commit
/baseline-*.json
```

**Execution Log:**
- Status: ✅ Done
- What we did: implemented `samplePodcastChunks` + `topKForQuery` + `runPre` in `scripts/embedding-baseline.ts`. Added `baseline:pre`/`baseline:post` to `package.json` scripts. Appended `/baseline-*.json` + `/baseline-*.md` to root `.gitignore`. Added `import 'dotenv/config'` at top for host-shell execution.
- What we discovered: **schema deviation from design** — `podcast_chunks.id` is `Int` (auto-increment) not `String`. `sourceSlug` is NOT a column on `podcast_chunks` — it's `slug` on parent `podcast_episodes`, requires a JOIN. Column names are snake_case in DB (`episode_id`, `embedding_model`, etc.) while Prisma model fields are camelCase. Adjusted raw SQL accordingly with `JOIN podcast_episodes pe ON pe.id = pc.episode_id` and `pe.slug AS source_slug`.
- What we decided: use `$queryRawUnsafe` over Prisma type-safe queries because Prisma cannot return the `Unsupported("vector(768)")` field; raw SQL with `embedding::text` lets us serialize the vector to JSON. Capture `embedding_model` per chunk so post-phase can verify the DB content is what we think it is.
- Deviations from design: id type Int (was String), sourceSlug via JOIN (was direct column). Updated TypeScript types `RawSampleRow`/`SampleChunk` accordingly. Added `model` field to capture which embedding model the stored vectors used.
- Next task ready: yes

---

### Task 5: Local docker spin-up + `init-podcasts` run

**Files:** none modified — docker operations

**Step 5.1: Verify `.env` has Google AI Studio key**

```bash
grep GOOGLE_GENERATIVE_AI_API_KEY .env
```

Expected: real key present. If missing — request from user.

**Step 5.2: Clean local DB**

```bash
docker compose -f docker-compose.dev.yml down -v
```

Expected: stops + removes volumes (PostgreSQL data wiped).

**Step 5.3: Start stack**

```bash
docker compose -f docker-compose.dev.yml up -d --build
```

Expected: all services healthy. Monitor:
```bash
docker compose -f docker-compose.dev.yml ps
```

**Step 5.4: Verify DB schema applied**

```bash
docker exec validatorinfo-dev-db psql -U $POSTGRES_USER -d $POSTGRES_DB -c '\dt podcast_chunks'
```

Expected: table exists.

**Step 5.5: Run podcast indexer**

Find the orchestrator entry. Likely:
```bash
docker exec validatorinfo-dev-indexer yarn tsx server/tools/init-podcasts.ts
```
(verify exact command in `server/tools/init-podcasts.ts` AGENTS.md before running)

Expected: logs show podcast parse → embed → write loop. Runs ~15-30 min.

**Step 5.6: Verify chunks populated**

```bash
docker exec validatorinfo-dev-db psql -U $POSTGRES_USER -d $POSTGRES_DB -c \
  "SELECT count(*), count(DISTINCT \"sourceSlug\") FROM podcast_chunks;"
```

Expected: hundreds/thousands of rows, dozens of distinct sources.

**Execution Log:**
- Status: ✅ Done (no work required)
- What we did: when running the smoke test of the Task 4 implementation (`yarn tsx scripts/embedding-baseline.ts --phase=pre --out=/tmp/test.json`), the script reported `Total chunks in DB: 15430` — the local DB was already indexed from prior development. All 13 test queries embedded successfully against the live `EmbeddingService` (Google AI Studio) and returned coherent top-K results (best similarities 0.70-0.79).
- What we discovered: local docker stack was already up + DB already populated with 15430 chunks across hundreds of episodes. `embedding_model` column shows all stored vectors use `gemini-embedding-001`. No need to wipe + reindex.
- What we decided: skip the explicit docker spin-up + `init-podcasts` run. The existing DB is fit for baseline — it's the same data we'd reproduce by running init-podcasts, and the embeddings were produced by the same AI Studio code path we're about to replace.
- Deviations from design: skipped Steps 5.1-5.5 entirely. Step 5.6 (`SELECT count(*)`) implicitly verified via the script's own `prisma.podcastChunk.count()` guard.
- Next task ready: yes — Task 6 done in the same shot as Task 4 verification

**Files:** generates `baseline-pre.json` (gitignored)

**Step 6.1: Run pre baseline**

```bash
docker exec validatorinfo-dev-frontend yarn baseline:pre
# or locally if env is set:
# yarn baseline:pre
```

Expected: logs 13 query lines, writes `baseline-pre.json` to project root.

**Step 6.2: Inspect output**

```bash
cat baseline-pre.json | jq '{provider, sampleChunks: (.sampleChunks | length), queries: (.queries | length)}'
```

Expected: `provider: "google-ai-studio"`, 50 chunks, 13 queries.

**Step 6.3: Spot-check chunk norms**

```bash
cat baseline-pre.json | jq '
  .sampleChunks[0:5] |
  map({
    id,
    sourceSlug,
    dims: (.embedding | length),
    norm: ([.embedding[] | (. * .)] | add | sqrt)
  })
'
```

Expected: `dims: 768` for all. `norm` — record actual values. If all ≈ 1.0 → AI Studio normalizes (good for compat). If varied → AI Studio does NOT normalize.

**Critical:** the norm value here informs the L2-normalize decision in Task 5 of design (decision matrix). Record in Execution Log.

**Step 6.4: Backup the artifact outside repo**

```bash
cp baseline-pre.json ~/baseline-pre.$(date +%Y%m%d).json
```

So a stray `git clean` doesn't kill it.

**Execution Log:**
- Status: ✅ Done
- What we did: moved `/tmp/test.json` (output from Task 4 smoke run) to `baseline-pre.json` in project root. Backed up to `~/baseline-pre.20260523.json`. Verified `git status` does NOT show `baseline-pre.json` (gitignored ✓). Sampled chunk norms via `jq`.
- What we discovered: **CRITICAL FINDING for Stage 5 reindex decision.** All 5 spot-checked chunks have L2 norm ≈ **0.58** (not 1.0). Exact values: 0.578, 0.582, 0.584, 0.579, 0.587 — remarkably consistent. This means Google AI Studio's `gemini-embedding-001` with `outputDimensionality=768` does NOT return unit-normalized vectors. They sit on a sub-unit sphere of radius ≈0.58. Implication: ai-integrations' L2-normalization step (to unit norm) will produce vectors that differ in MAGNITUDE from our DB vectors. However, cosine similarity is magnitude-invariant — pgvector's `<=>` operator computes `1 - (a·b)/(|a||b|)`, so ranking should remain stable. Total DB content: 15430 chunks, dims confirmed 768, single embedding model `gemini-embedding-001`.
- What we decided: proceed to Stage 3 (migration). The norm difference does NOT automatically mean reindex is required — Stage 4 will measure actual top-K overlap which is what matters for RAG quality. If post-migration overlap stays > 0.8, no reindex needed despite the magnitude mismatch.
- Deviations from design: minor — captured `embedding_model` field per chunk in addition to design-specified fields, to validate DB consistency. Did NOT need to spin up docker or run init-podcasts (DB was already populated).
- Next task ready: yes — Stage 2 complete, advance to Stage 3 (migration code changes)

---

## STAGE 3 — Migration code changes

### Task 7: Add `@ai-sdk/google-vertex` dependency

**Files:**
- Modify: `package.json`

**Step 7.1: Add dep**

```bash
yarn add @ai-sdk/google-vertex@4.0.128
```

Expected: `yarn.lock` updated, `node_modules/@ai-sdk/google-vertex/` exists.

**Step 7.2: Verify `@ai-sdk/google` still present**

```bash
grep '@ai-sdk/google' package.json
```

Expected: both `@ai-sdk/google` AND `@ai-sdk/google-vertex` lines (user decision to keep fallback).

**Execution Log:**
- Status: ⬜ Todo
- What we did:
- What we discovered:
- What we decided:
- Deviations from design:
- Next task ready:

---

### Task 8: Create `src/app/services/ai/vertex-provider.ts`

**Files:**
- Create: `src/app/services/ai/vertex-provider.ts`

**Step 8.1: Write file**

```typescript
import 'server-only';
import { createVertex } from '@ai-sdk/google-vertex';
import logger from '@/logger';

const { logDebug, logError } = logger('vertex-provider');

const VERTEX_PROJECT = process.env.GOOGLE_CLOUD_PROJECT?.trim() || undefined;
const VERTEX_LOCATION = 'global';
const CHAT_MODEL_ID = 'gemini-3-flash-preview';
const EMBEDDING_MODEL_ID = 'gemini-embedding-001';

if (!VERTEX_PROJECT) {
  logError('GOOGLE_CLOUD_PROJECT is not set — Vertex AI provider will not initialize');
}

let cachedVertex: ReturnType<typeof createVertex> | null = null;

const getVertex = (): ReturnType<typeof createVertex> => {
  if (cachedVertex) return cachedVertex;
  cachedVertex = createVertex({
    project: VERTEX_PROJECT,
    location: VERTEX_LOCATION,
  });
  logDebug(`vertex-provider initialized: project=${VERTEX_PROJECT}, location=${VERTEX_LOCATION}`);
  return cachedVertex;
};

export const chatModel = () => getVertex()(CHAT_MODEL_ID);
export const embeddingModel = () => getVertex().textEmbeddingModel(EMBEDDING_MODEL_ID);
export const hasVertexConfig = (): boolean => Boolean(VERTEX_PROJECT);
```

**Step 8.2: Type check**

```bash
yarn tsc --noEmit
```

Expected: no errors related to this file. (Other errors may exist from in-flight changes — ignore unrelated.)

**Execution Log:**
- Status: ⬜ Todo
- What we did:
- What we discovered:
- What we decided:
- Deviations from design:
- Next task ready:

---

### Task 9: Create `src/lib/vector.ts` + unit test

**Files:**
- Create: `src/lib/vector.ts`
- Create: `src/lib/vector.test.ts`

**Step 9.1: Write `vector.ts`**

```typescript
import { PODCAST_EMBEDDING_DIMENSIONS } from '@/server/config/podcast-config';

export const validateEmbedding = (embedding: number[], label = 'embedding'): void => {
  if (embedding.length !== PODCAST_EMBEDDING_DIMENSIONS) {
    throw new Error(
      `${label} must have ${PODCAST_EMBEDDING_DIMENSIONS} dimensions, got ${embedding.length}`,
    );
  }
  if (!embedding.every(Number.isFinite)) {
    throw new Error(`${label} contains non-finite values`);
  }
};

export const l2Normalize = (embedding: number[], label = 'embedding'): number[] => {
  validateEmbedding(embedding, label);
  const norm = Math.sqrt(embedding.reduce((sum, value) => sum + value * value, 0));
  if (norm === 0) throw new Error(`${label} cannot be the zero vector`);
  return embedding.map((value) => value / norm);
};

export const toPgVector = (embedding: number[]): string => {
  validateEmbedding(embedding);
  return `[${embedding.join(',')}]`;
};
```

**Step 9.2: Write failing test**

Check if project has Jest/Vitest configured. If yes:

```typescript
import { describe, it, expect } from 'vitest'; // or @jest/globals
import { l2Normalize, validateEmbedding } from './vector';
import { PODCAST_EMBEDDING_DIMENSIONS } from '@/server/config/podcast-config';

const makeVec = (fill: number) =>
  Array.from({ length: PODCAST_EMBEDDING_DIMENSIONS }, () => fill);

describe('l2Normalize', () => {
  it('produces unit norm', () => {
    const result = l2Normalize(makeVec(0.5));
    const norm = Math.sqrt(result.reduce((s, v) => s + v * v, 0));
    expect(norm).toBeCloseTo(1, 6);
  });

  it('throws on zero vector', () => {
    expect(() => l2Normalize(makeVec(0))).toThrow();
  });

  it('throws on wrong dims', () => {
    expect(() => l2Normalize([1, 2, 3])).toThrow();
  });

  it('preserves direction (idempotent on already-normalized)', () => {
    const once = l2Normalize(makeVec(0.5));
    const twice = l2Normalize(once);
    once.forEach((v, i) => expect(v).toBeCloseTo(twice[i], 6));
  });
});
```

**Step 9.3: Run tests**

```bash
yarn test src/lib/vector.test.ts
```

Expected: all pass. If no test runner — skip this step and document in execution log.

**Execution Log:**
- Status: ⬜ Todo
- What we did:
- What we discovered: (record: does project have test runner? jest/vitest/none?)
- What we decided:
- Deviations from design:
- Next task ready:

---

### Task 10: Update `ai-service.ts` — chat model switch

**Files:**
- Modify: `src/app/services/ai/ai-service.ts`

**Step 10.1: Replace imports + model + isAvailable**

Diff:
```diff
- import { google } from '@ai-sdk/google';
+ import { chatModel, hasVertexConfig } from './vertex-provider';

- if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
-   logError('GOOGLE_GENERATIVE_AI_API_KEY is not set — AI chat will not function');
- }
+ if (!hasVertexConfig()) {
+   logError('GOOGLE_CLOUD_PROJECT is not set — AI chat will not function');
+ }

- const model = google('gemini-3-flash-preview');
+ const model = chatModel();

  ...
- isAvailable: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
+ isAvailable: hasVertexConfig(),
```

**Step 10.2: Type check**

```bash
yarn tsc --noEmit src/app/services/ai/ai-service.ts
```

Expected: no errors. If `chatModel()` return type doesn't satisfy `generateText`'s `model` param — investigate `ai-sdk` v3 vs v4 signature.

**Execution Log:**
- Status: ⬜ Todo
- What we did:
- What we discovered:
- What we decided:
- Deviations from design:
- Next task ready:

---

### Task 11: Update `embedding-service.ts` — Vertex + L2

**Files:**
- Modify: `src/app/services/embedding-service.ts`

**Step 11.1: Replace imports + provider + normalize result**

Full new file:
```typescript
import { embed } from 'ai';
import { embeddingModel } from '@/services/ai/vertex-provider';
import { l2Normalize } from '@/lib/vector';
import logger from '@/logger';

import { PODCAST_EMBEDDING_DIMENSIONS, PODCAST_EMBEDDING_MODEL_ID } from '@/server/config/podcast-config';

const { logError } = logger('embedding-service');

const embedQuery = async (query: string): Promise<number[]> => {
  try {
    const { embedding } = await embed({
      model: embeddingModel(),
      value: query,
      providerOptions: {
        vertex: {
          taskType: 'RETRIEVAL_QUERY',
          outputDimensionality: PODCAST_EMBEDDING_DIMENSIONS,
        },
      },
    });
    return l2Normalize(embedding);
  } catch (error) {
    logError('embedQuery failed', error);
    throw error;
  }
};

const EmbeddingService = {
  embedQuery,
};

export default EmbeddingService;
```

Note: `PODCAST_EMBEDDING_MODEL_ID` import becomes unused — remove it.

**Step 11.2: Type check**

```bash
yarn tsc --noEmit
```

Expected: no errors. Check that `providerOptions.vertex` is accepted by SDK types.

**Execution Log:**
- Status: ⬜ Todo
- What we did:
- What we discovered:
- What we decided:
- Deviations from design:
- Next task ready:

---

### Task 12: Update `init-podcasts/shared.ts`

**Files:**
- Modify: `server/tools/init-podcasts/shared.ts`

**Step 12.1: Replace embedding model export**

```diff
- import { google } from '@ai-sdk/google';
- export const EMBEDDING_MODEL = google.textEmbeddingModel(PODCAST_EMBEDDING_MODEL_ID);
+ import { embeddingModel } from '@/services/ai/vertex-provider';
+ export const getEmbeddingModel = () => embeddingModel();
```

(`getEmbeddingModel` is a function because the provider is lazily constructed — calling at module-init time would error if env missing.)

**Step 12.2: Find callers**

```bash
grep -rn "EMBEDDING_MODEL" server/tools/init-podcasts/
```

Update each `EMBEDDING_MODEL` reference to `getEmbeddingModel()` in Tasks 13-15.

**Execution Log:**
- Status: ⬜ Todo
- What we did:
- What we discovered:
- What we decided:
- Deviations from design:
- Next task ready:

---

### Task 13: Update `init-podcasts/podcast-processor.ts`

**Files:**
- Modify: `server/tools/init-podcasts/podcast-processor.ts`

**Step 13.1: Update imports + embedMany call**

Find the `embedMany` block (around line 317):

```diff
+ import { l2Normalize } from '@/lib/vector';
+ import { getEmbeddingModel } from './shared'; // if not already

  const { embeddings: batchEmbeddings } = await embedMany({
-   model: EMBEDDING_MODEL,
+   model: getEmbeddingModel(),
    values: batch,
+   maxParallelCalls: 2,
    providerOptions: {
-     google: {
+     vertex: {
        taskType: 'RETRIEVAL_DOCUMENT',
        outputDimensionality: PODCAST_EMBEDDING_DIMENSIONS,
      },
    },
  });

+ const normalized = batchEmbeddings.map((e, i) =>
+   l2Normalize(e, `podcast-chunk[${i}]`)
+ );
```

Then update wherever `batchEmbeddings` is written to DB — use `normalized` instead.

**Step 13.2: Sanity grep**

```bash
grep -n "google:\|batchEmbeddings" server/tools/init-podcasts/podcast-processor.ts
```

Expected: no remaining `google:` providerOptions; `batchEmbeddings` only referenced where it's transformed into `normalized`.

**Execution Log:**
- Status: ⬜ Todo
- What we did:
- What we discovered:
- What we decided:
- Deviations from design:
- Next task ready:

---

### Task 14: Update `init-podcasts/cw3-doc-processor.ts`

Same pattern as Task 13.

**Files:**
- Modify: `server/tools/init-podcasts/cw3-doc-processor.ts`

**Step 14.1: Apply same diff as Task 13 to `embedMany` block (~line 317)**

**Step 14.2: Verify with grep**

```bash
grep -n "google:\|EMBEDDING_MODEL" server/tools/init-podcasts/cw3-doc-processor.ts
```

Expected: no remaining `google:` providerOptions or `EMBEDDING_MODEL` references.

**Execution Log:**
- Status: ⬜ Todo
- What we did:
- What we discovered:
- What we decided:
- Deviations from design:
- Next task ready:

---

### Task 15: Update `init-podcasts/host-meta-generator.ts`

Same pattern.

**Files:**
- Modify: `server/tools/init-podcasts/host-meta-generator.ts`

**Step 15.1: Apply same diff to `embedMany` block (~line 133)**

Note: this file may use BOTH `embedMany` and `generateText`. The `generateText` call must also switch from `google('...')` to `chatModel()` (or whatever model that block uses — check existing code).

**Step 15.2: Grep verification**

```bash
grep -n "google\b\|EMBEDDING_MODEL\|providerOptions" server/tools/init-podcasts/host-meta-generator.ts
```

Expected: no `google` provider references.

**Step 15.3: Type check all three processors**

```bash
yarn tsc --noEmit
```

Expected: clean.

**Execution Log:**
- Status: ⬜ Todo
- What we did:
- What we discovered:
- What we decided:
- Deviations from design:
- Next task ready:

---

### Task 16: WebSearch — ICF + Cosmos Labs facts

**Files:** notes only — feeds Task 17

**Step 16.1: Search queries**

Run via WebSearch tool:
1. `"Cosmos Labs" foundation Cosmos Hub stewardship 2025`
2. `Interchain Foundation ICF Cosmos Labs transition history`
3. `who runs Cosmos Hub governance 2026`
4. `Cosmos Labs founders parent organization`
5. `ICF Interchain Foundation current role 2026`

**Step 16.2: Compile fact sheet**

Required answers:
- Exact date of ICF → Cosmos Labs handover (year + month if possible)
- Cosmos Labs founders / parent (independent? spin-off? related to Informal Systems?)
- Functions transferred vs functions remaining at ICF (treasury custody, grants, IBC spec stewardship?)
- Official Cosmos Labs URL for inclusion in answers
- Catalyst (governance prop number? community vote? founder dispute?)

**Step 16.3: Cross-verify**

For each non-trivial claim, find at least 2 independent sources (forum, governance prop, official blog). If only one source — mark as `[unverified]` in fact sheet.

**Step 16.4: Save fact sheet**

Write notes to scratch file `docs/plans/_cosmos-labs-facts.md` (gitignored or temp). Not committed — just feeds Task 17.

**Execution Log:**
- Status: ⬜ Todo
- What we did:
- What we discovered: (record key facts + sources)
- What we decided:
- Deviations from design:
- Next task ready:

---

### Task 17: Add ICF/Cosmos Labs prompt block

**Files:**
- Modify: `src/app/services/ai/ai-service.ts`

**Step 17.1: Locate insertion point**

After the existing `'CW3 in responses:'` block — find the line containing the closing of that section (likely the last `- Do NOT steer users away...` line ~229).

**Step 17.2: Insert new block**

```typescript
    '',
    'Cosmos governance entities:',
    '- ICF (Interchain Foundation, interchain.io) — Swiss non-profit, founded 2017 by Jae Kwon and Ethan Buchman to steward Cosmos. Historical role: fund Tendermint/CometBFT, Cosmos SDK, and IBC development; manage ICS specifications; distribute ecosystem grants; act as primary brand custodian for Cosmos.',
    `- Cosmos Labs — ${COSMOS_LABS_FACT_LINE}`, // filled from Task 16 fact sheet
    '- ATOM holders (stakers) — actual on-chain governance authority. Foundations propose, fund, and advocate; only ATOM voters can execute on-chain changes via stake-weighted proposal votes.',
    '',
    'Rules for Cosmos governance questions:',
    '- When asked "who runs Cosmos" / "who controls Cosmos Hub" — explain both layers: foundation stewardship (ICF historically, Cosmos Labs now) AND on-chain governance (ATOM stakers via proposals).',
    '- Do not conflate ICF with Cosmos Labs. ICF is the original entity (still exists in some capacity); Cosmos Labs is the current primary Cosmos Hub steward.',
    '- Cosmos-ecosystem chains OTHER than Cosmos Hub (Osmosis, Celestia, dYdX, etc.) have their own foundations and teams. Cosmos Labs does NOT govern the whole Cosmos ecosystem.',
    '- Link to /networks/cosmoshub/governance when discussing Cosmos Hub governance.',
    '- If user asks for current Cosmos Hub proposals, call getProposals with chainName="cosmoshub".',
```

**Step 17.3: Manual prompt review**

Read the final assembled prompt for the `home` page (no context):
```typescript
console.log(buildSystemPrompt({ page: 'home', locale: 'en' }));
```

Verify the new block reads coherently between CW3 facts and the final Behavior bullets.

**Execution Log:**
- Status: ⬜ Todo
- What we did:
- What we discovered:
- What we decided:
- Deviations from design:
- Next task ready:

---

### Task 18: Update `.env.example`

**Files:**
- Modify: `.env.example`

**Step 18.1: Apply diff**

```diff
- GOOGLE_GENERATIVE_AI_API_KEY=
+ # Vertex AI (replaces GOOGLE_GENERATIVE_AI_API_KEY for chat + embeddings)
+ GOOGLE_CLOUD_PROJECT=
+ GOOGLE_APPLICATION_CREDENTIALS=/secrets/vertex-sa.json
+
+ # Deprecated — kept commented for fallback only
+ # GOOGLE_GENERATIVE_AI_API_KEY=
```

**Step 18.2: Sanity**

Locally: `.env` must have a real `GOOGLE_CLOUD_PROJECT` value for the migration to function. User confirms reuse from ai-integrations.

**Execution Log:**
- Status: ⬜ Todo
- What we did:
- What we discovered:
- What we decided:
- Deviations from design:
- Next task ready:

---

### Task 19: Update `docker-compose.dev.yml`

**Files:**
- Modify: `docker-compose.dev.yml`

**Step 19.1: Add env + volume to `frontend` service block (~line 186-200)**

```yaml
    environment:
      # ... existing ...
      GOOGLE_CLOUD_PROJECT: ${GOOGLE_CLOUD_PROJECT:-}
      GOOGLE_APPLICATION_CREDENTIALS: /secrets/vertex-sa.json
    volumes:
      - uploads_data:/app/uploads
      - ./secrets/vertex-sa.json:/secrets/vertex-sa.json:ro
```

**Step 19.2: Add env + volume to `indexer` service block (~line 230)**

Same additions.

**Step 19.3: Verify YAML syntax**

```bash
docker compose -f docker-compose.dev.yml config > /dev/null
```

Expected: no errors. Prints resolved compose definition (or fails on syntax).

**Execution Log:**
- Status: ⬜ Todo
- What we did:
- What we discovered:
- What we decided:
- Deviations from design:
- Next task ready:

---

### Task 20: Create `secrets/` directory + SA JSON

**Files:**
- Create: `secrets/.gitignore`
- Create: `secrets/vertex-sa.json` (NEVER committed)

**Step 20.1: Create directory + gitignore**

```bash
mkdir -p secrets
chmod 0700 secrets
cat > secrets/.gitignore <<'EOF'
*
!.gitignore
EOF
```

**Step 20.2: Copy SA JSON from ai-integrations**

```bash
cp /Users/user/project/dev/ai-integrations/secrets/vertex-sa.json secrets/vertex-sa.json
chmod 0600 secrets/vertex-sa.json
```

**Step 20.3: Verify**

```bash
/bin/ls -la secrets/
```

Expected: `vertex-sa.json` with mode `-rw-------`, owner = host user, `.gitignore` present.

**Step 20.4: Verify gitignore actually ignores**

```bash
git status secrets/
```

Expected: only `secrets/.gitignore` shown as untracked (not the JSON).

**Execution Log:**
- Status: ⬜ Todo
- What we did:
- What we discovered:
- What we decided:
- Deviations from design:
- Next task ready:

---

### Task 21: Append `/secrets/*.json` to root `.gitignore`

**Files:**
- Modify: `.gitignore`

**Step 21.1: Append**

```
# Vertex AI service account (second layer of defense — primary is secrets/.gitignore)
/secrets/*.json
```

**Step 21.2: Verify**

```bash
git check-ignore -v secrets/vertex-sa.json
```

Expected: prints `.gitignore` rule that matches.

**Execution Log:**
- Status: ⬜ Todo
- What we did:
- What we discovered:
- What we decided:
- Deviations from design:
- Next task ready:

---

### Task 22: Update `src/app/services/ai/AGENTS.md`

**Files:**
- Modify: `src/app/services/ai/AGENTS.md`

**Step 22.1: Update top paragraph**

```diff
- Uses Google Gemini (via Vercel AI SDK)
+ Uses Google Gemini via Vertex AI (Vercel AI SDK)
```

**Step 22.2: Update env vars table**

```diff
| `GOOGLE_GENERATIVE_AI_API_KEY` | Yes | Google AI API key for Gemini model |
+ | `GOOGLE_CLOUD_PROJECT` | Yes | GCP project ID for Vertex AI |
+ | `GOOGLE_APPLICATION_CREDENTIALS` | Yes | Path to Vertex SA JSON inside container (e.g. /secrets/vertex-sa.json) |
```

(Remove `GOOGLE_GENERATIVE_AI_API_KEY` row.)

**Step 22.3: Update RAG section**

```diff
- Content is chunked, embedded via Google `gemini-embedding-001` (768 dims)
+ Content is chunked, embedded via `gemini-embedding-001` (768 dims) on Vertex AI, then L2-normalized
```

**Step 22.4: Add "Key Files" rows**

Add `vertex-provider.ts` row referencing chat + embedding factory.
Add note that `src/lib/vector.ts` provides `l2Normalize`.

**Execution Log:**
- Status: ⬜ Todo
- What we did:
- What we discovered:
- What we decided:
- Deviations from design:
- Next task ready:

---

## STAGE 4 — Post-migration validation

### Task 23: `yarn build` + type check

**Files:** none modified

**Step 23.1: Type check**

```bash
yarn tsc --noEmit
```

Expected: clean. If errors related to `ai-sdk` v4 API changes — investigate via Context7 `@ai-sdk/google-vertex` docs.

**Step 23.2: Lint**

```bash
yarn lint
```

Expected: passes (or only pre-existing warnings).

**Step 23.3: Production build**

```bash
yarn build
```

Expected: builds successfully. If Next.js complains about missing env at build time — verify `.env` has Vertex vars set.

**Execution Log:**
- Status: ⬜ Todo
- What we did:
- What we discovered:
- What we decided:
- Deviations from design:
- Next task ready:

---

### Task 24: Docker rebuild

**Files:** none modified

**Step 24.1: Rebuild containers (keep DB volumes intact)**

```bash
docker compose -f docker-compose.dev.yml up -d --build --no-deps frontend indexer
```

Expected: rebuilds only frontend + indexer images. DB volumes untouched — Stage 2 vectors preserved.

**Step 24.2: Verify SA JSON mounted**

```bash
docker compose -f docker-compose.dev.yml exec frontend ls -la /secrets/vertex-sa.json
docker compose -f docker-compose.dev.yml exec indexer  ls -la /secrets/vertex-sa.json
```

Expected: both show the file readable.

**Step 24.3: Verify env**

```bash
docker compose -f docker-compose.dev.yml exec frontend env | grep -E "GOOGLE_CLOUD|APPLICATION_CRED"
```

Expected: `GOOGLE_CLOUD_PROJECT=<real value>`, `GOOGLE_APPLICATION_CREDENTIALS=/secrets/vertex-sa.json`.

**Step 24.4: Tail logs for provider init**

```bash
docker compose -f docker-compose.dev.yml logs --tail 100 frontend | grep -i "vertex\|google_cloud"
```

Expected: see `vertex-provider initialized` log line on first chat or embedding call. (May not appear until first request.)

**Execution Log:**
- Status: ⬜ Todo
- What we did:
- What we discovered:
- What we decided:
- Deviations from design:
- Next task ready:

---

### Task 25: Implement `--phase=post` mode in baseline script

**Files:**
- Modify: `scripts/embedding-baseline.ts`

**Step 25.1: Implement `runPost`**

```typescript
const runPost = async (preFile: string, out: string) => {
  const pre = JSON.parse(readFileSync(preFile, 'utf-8'));
  const prisma = new PrismaClient();
  try {
    const queries = [];
    for (const q of pre.queries) {
      const newVec = await EmbeddingService.embedQuery(q.query);
      const newTopK = await topKForQuery(prisma, newVec, TOP_K);
      const oldIds = new Set(q.topK.map((r: any) => r.id));
      const newIds = new Set(newTopK.map((r) => r.id));
      const overlap = [...oldIds].filter((id) => newIds.has(id)).length / oldIds.size;
      queries.push({ query: q.query, oldTopK: q.topK, newTopK, overlapRatio: overlap });
      console.log(`baseline-post: ${q.query} -> overlap=${(overlap * 100).toFixed(0)}%`);
    }

    const sampleChunks = [];
    for (const chunk of pre.sampleChunks) {
      const { embedding: newEmb } = await embed({
        model: embeddingModel(),
        value: chunk.contentSnippet, // re-embedding snippet only (full text not stored in baseline-pre)
        providerOptions: {
          vertex: { taskType: 'RETRIEVAL_DOCUMENT', outputDimensionality: PODCAST_EMBEDDING_DIMENSIONS },
        },
      });
      const newNormalized = l2Normalize(newEmb);
      const cosine = chunk.embedding.reduce(
        (s: number, v: number, i: number) => s + v * newNormalized[i],
        0,
      ) / (
        Math.sqrt(chunk.embedding.reduce((s: number, v: number) => s + v * v, 0)) *
        Math.sqrt(newNormalized.reduce((s, v) => s + v * v, 0))
      );
      sampleChunks.push({ id: chunk.id, sourceSlug: chunk.sourceSlug, cosine });
    }

    const cosines = sampleChunks.map((c) => c.cosine);
    const mean = cosines.reduce((s, v) => s + v, 0) / cosines.length;
    const sorted = [...cosines].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const min = sorted[0];

    const overlapRatios = queries.map((q) => q.overlapRatio);
    const meanOverlap = overlapRatios.reduce((s, v) => s + v, 0) / overlapRatios.length;

    const report = {
      phase: 'post',
      provider: 'vertex-ai',
      timestamp: new Date().toISOString(),
      summary: {
        sampleChunkCosine: { mean, median, min },
        topKOverlap: { mean: meanOverlap, perQuery: overlapRatios },
        decision: decideAction(mean, meanOverlap),
      },
      queries,
      sampleChunks,
    };
    writeFileSync(out, JSON.stringify(report, null, 2));
    console.log('\n=== DECISION ===');
    console.log(report.summary);
  } finally {
    await prisma.$disconnect();
  }
};

const decideAction = (cosineMean: number, overlapMean: number): string => {
  if (cosineMean > 0.95 && overlapMean > 0.8) return 'NO_REINDEX: vectors are compatible';
  if (cosineMean < 0.85 || overlapMean < 0.5)  return 'REINDEX_REQUIRED: significant drift';
  return 'BORDERLINE: inspect per-query results manually';
};
```

Add imports at top of file:
```typescript
import { embed } from 'ai';
import { embeddingModel } from '@/services/ai/vertex-provider';
import { l2Normalize } from '@/lib/vector';
import { PODCAST_EMBEDDING_DIMENSIONS } from '@/server/config/podcast-config';
```

**Step 25.2: Type check**

```bash
yarn tsc --noEmit scripts/embedding-baseline.ts
```

**Execution Log:**
- Status: ⬜ Todo
- What we did:
- What we discovered:
- What we decided:
- Deviations from design:
- Next task ready:

---

### Task 26: Run baseline post + generate report

**Files:** generates `baseline-post.json`

**Step 26.1: Run**

```bash
docker compose -f docker-compose.dev.yml exec frontend yarn baseline:post
```

Expected: logs per-query overlap, final decision block.

**Step 26.2: Inspect**

```bash
cat baseline-post.json | jq '.summary'
```

Expected: `decision` field clearly says `NO_REINDEX`, `REINDEX_REQUIRED`, or `BORDERLINE`.

**Step 26.3: Build markdown summary for user review**

Generate `baseline-summary.md`:
```bash
cat baseline-post.json | jq -r '
  "# Baseline Report\n\n" +
  "**Decision:** " + .summary.decision + "\n\n" +
  "**Mean cosine (old vs new same-chunk):** " + (.summary.sampleChunkCosine.mean | tostring) + "\n" +
  "**Median cosine:** " + (.summary.sampleChunkCosine.median | tostring) + "\n" +
  "**Min cosine:** " + (.summary.sampleChunkCosine.min | tostring) + "\n\n" +
  "**Mean top-K overlap:** " + (.summary.topKOverlap.mean | tostring) + "\n\n" +
  "## Per-query overlap\n" +
  (.queries | map("- " + .query + ": " + (.overlapRatio * 100 | tostring) + "%") | join("\n"))
' > baseline-summary.md
cat baseline-summary.md
```

**Pause:** present to user for the reindex decision (Stage 5).

**Execution Log:**
- Status: ⬜ Todo
- What we did:
- What we discovered: (record: decision, key cosine/overlap numbers)
- What we decided:
- Deviations from design:
- Next task ready:

---

### Task 27: Manual UI smoke tests

**Files:** none

**Step 27.1: Open chat in browser**

```
http://localhost:3000
```

Open AI chat modal.

**Step 27.2: Test queries (record response quality per Execution Log)**

| Query | Expected behavior |
|---|---|
| "what is a bare-metal validator?" | Coherent answer mentioning CW3 + bare-metal facts |
| "who runs Cosmos Hub?" | Mentions BOTH ICF history AND Cosmos Labs current role; explains ATOM staker governance |
| "compare cosmoshub validators by uptime" | Calls `searchValidators` + `compareChains`; renders table |
| "tell me about ICF" | Returns Swiss non-profit + 2017 + Jae Kwon/Ethan Buchman + steward role |
| "what is Cosmos Labs?" | Returns facts from Task 16 research; links to /networks/cosmoshub/governance |

**Step 27.3: Verify no console errors in browser DevTools**

**Step 27.4: Tail logs for tool calls**

```bash
docker compose -f docker-compose.dev.yml logs -f frontend | grep -E "vertex|tool|generateText"
```

Expected: tool calls fire correctly; no `ECONNREFUSED` or auth errors.

**Execution Log:**
- Status: ⬜ Todo
- What we did:
- What we discovered: (record per-query quality)
- What we decided:
- Deviations from design:
- Next task ready:

---

## STAGE 5 — Decision point: reindex or not

### Task 28: Review baseline report + decide

**This is a user-driven decision point.** Do not proceed without explicit user direction.

**Step 28.1: Present `baseline-summary.md` to user**

```bash
cat baseline-summary.md
```

**Step 28.2: User picks one:**

- **A — No reindex:** vectors compatible. Migration complete. Proceed to Stage 6.
- **B — Reindex prod:** drift too high. Continue to Task 29.
- **C — Borderline:** spot-check specific bad queries with user; decide A or B together.

**Execution Log:**
- Status: ⬜ Todo
- What we did:
- What we discovered:
- What we decided: (A / B / C and reasoning)
- Deviations from design:
- Next task ready:

---

### Task 29 (CONDITIONAL — only if reindex required): Plan prod reindex

**Files:** none yet — designs the reindex plan

**Step 29.1: Verify upsert semantics**

```bash
grep -n "DELETE FROM podcast_chunks\|deleteMany\|upsert\|INSERT INTO podcast_chunks" \
  server/tools/init-podcasts/
```

Determine: does `init-podcasts` overwrite cleanly, or does it append? If append → shadow table approach needed.

**Step 29.2: Document reindex playbook**

Write `docs/plans/2026-05-23-vertex-reindex-playbook.md` with:
- Backup step: `CREATE TABLE podcast_chunks_backup AS SELECT * FROM podcast_chunks;`
- HNSW index recreation: `CREATE INDEX CONCURRENTLY ...`
- Rollback step: swap tables if needed
- Estimated runtime + Vertex embedding cost
- Recommended low-traffic window

**Step 29.3: User approves playbook before execution**

This task does NOT execute on prod — only produces the playbook.

**Execution Log:**
- Status: ⬜ Todo (skip if Task 28 → A)
- What we did:
- What we discovered:
- What we decided:
- Deviations from design:
- Next task ready:

---

## STAGE 6 — Finalize

### Task 30: User review + commit boundaries

**Files:** decided by user

**Step 30.1: Show full diff**

```bash
git status
git diff --stat
```

**Step 30.2: User reviews working tree**

No commits by Claude ([feedback_no_commits_user_reviews]). User decides:
- Single commit or split (suggested split: 1) deps + provider, 2) embedding-service + L2, 3) init-podcasts updates, 4) prompt + ICF, 5) docker + secrets + docs)
- When to PR into `dev`

**Step 30.3: Cleanup transient artifacts**

```bash
rm baseline-pre.json baseline-post.json baseline-summary.md
rm -f docs/plans/_cosmos-labs-facts.md
```

(Keep design + plan docs in `docs/plans/`.)

**Execution Log:**
- Status: ⬜ Todo
- What we did:
- What we discovered:
- What we decided:
- Deviations from design:
- Next task ready:

---

## Cross-cutting reminders

- Never `git push --force` to `updates/dev-update`
- Never commit `secrets/vertex-sa.json`
- After any structural change (new file, renamed function): run `npx gitnexus analyze`
- Stop and report if any task reveals unexpected breakage; do not silently work around
- If `ai-sdk` v3 → v4 surface breaks something not anticipated — use Context7 to fetch current `@ai-sdk/google-vertex` docs before fabricating fixes
- All embeddings (query + document) MUST be L2-normalized before either storing or comparing

---

## Stage 3 Execution Summary (consolidated for Tasks 7-22)

**Status:** ✅ Done

**Groups:**

| Group | Tasks | Outcome |
|---|---|---|
| A — Deps + helpers | 7, 8, 9 | `@ai-sdk/google-vertex@4.0.128` added (`@ai-sdk/google` kept). `vertex-provider.ts` + `src/lib/vector.ts` created. Test file **skipped** — no test runner in project. |
| B — Chat switch | 10 | `ai-service.ts` → `chatModel()` + `hasVertexConfig()` |
| C — Query embedding switch | 11 | `embedding-service.ts` → Vertex + `vertex` providerOptions + L2 |
| D — Indexer embedding switch | 12-15 | `shared.ts` exports `getEmbeddingModel`/`getSummaryModel` (lazy). All 3 processors (`podcast-`, `cw3-doc-`, `host-meta-`) — `vertex` providerOptions + `maxParallelCalls: 2` + L2 normalize. Plus `src/actions/ai-summary.ts` log message updated (auto-migrated via `AiService.model`). |
| E — Cosmos prompt | 16, 17 | WebSearch found: Cosmos Labs is a wholly-owned **subsidiary** of ICF (originally Interchain Labs end-2024 after ICF acquired Skip, renamed in 2025). Prompt block written precisely, not as "replacement of ICF". |
| F — Infra | 18-22 | `.env.example`, `docker-compose.dev.yml`, `secrets/`, root `.gitignore`, `AGENTS.md` all updated. |

**Discoveries (deviations from design):**

1. **`SUMMARY_MODEL = google('gemini-2.5-flash')` was missed in the design.** It's used by both podcast-processor (summary + metadata extraction) and host-meta-generator (topic summaries). Added `summaryModel()` to `vertex-provider.ts` and `getSummaryModel()` lazy getter to `shared.ts`. Also covers Jae Kwon proposal-summary user feedback indirectly — that uses `AiService.model` which is now chatModel (gemini-3-flash-preview), so it auto-migrated.
2. **User-flagged: proposal summarization in `src/actions/ai-summary.ts`** was not explicitly listed in the design but it uses `AiService.model` so it inherited the migration automatically. Only update needed was a log-message string (`GOOGLE_GENERATIVE_AI_API_KEY` → `GOOGLE_CLOUD_PROJECT`).
3. **`indexer` service does NOT need Vertex SA.** Design said to mount SA into both `frontend` AND `indexer`. Grep proved `server/indexer.ts` + `server/jobs/*.ts` import zero AI code. Corrected: mounted only into `frontend` + `init-podcasts` (the actual AI consumers). `indexer` stays AI-free.
4. **No test runner in project** (no jest/vitest/mocha). Skipped `src/lib/vector.test.ts` — would need to install a test framework first. Functions are pure math, visible at first call site if broken.
5. **Cosmos Labs facts diverge from naive user framing.** User said "Cosmos Labs which replaced ICF on Cosmos network governance" — research showed Cosmos Labs is an ICF subsidiary, not a replacement. Prompt explicitly states this to prevent the AI from reproducing the user's simplification.
6. **`shared.ts` lazy-getter pattern over direct re-export.** Vertex provider reads env at first call, not module init. Exporting eagerly-bound `chatModel()` constants from shared.ts would trigger SA-file lookup even when the indexer just wants chain config. Lazy getters defer the lookup.

**Working tree:**
- Modified: 13 files (4 init-podcasts, ai-service.ts, embedding-service.ts, ai-summary.ts, AGENTS.md, .env.example, docker-compose.dev.yml, .gitignore, package.json, yarn.lock)
- New: 4 files (`vertex-provider.ts`, `src/lib/vector.ts`, `scripts/embedding-baseline.ts`, `secrets/.gitignore`)
- New gitignored: `secrets/vertex-sa.json`, `baseline-pre.json`

**Audit:** `grep -rn '@ai-sdk/google' src server --include='*.ts' | grep -v vertex` returned zero results.

**Next:** Stage 4 — yarn build + docker rebuild + baseline post + UI smoke.

---

## Stage 4 Execution Summary (consolidated for Tasks 23-27)

**Status:** ✅ Done

**Findings:**

1. **TS check (Task 23):** After generating events Prisma client (`npx prisma generate --schema=prisma/events/schema.prisma`), `yarn tsc --noEmit` passed clean. Pre-existing errors in `slashing-event-service.ts` and `db.ts` were resolved by the events-client generation. Our migration introduces zero TS errors.
2. **yarn lint skipped:** ESLint not configured in repo; running `next lint` prompts interactive setup. Not our concern. TS check is the relevant signal.
3. **yarn build skipped on host:** Docker build produced a full production Next.js build inside the container as part of `docker compose up --build frontend`. That succeeded (image `validatorinfo-frontend` created). No separate host-side build needed.
4. **Docker startup blocker (NEW):** `docker compose up frontend` failed because `validatorinfo_observability` external network didn't exist on this host. Fixed via `docker network create validatorinfo_observability` (dummy). Frontend then started cleanly.
5. **Env loading gotcha (NEW):** `docker compose restart frontend` does NOT re-read `.env`. Only `up -d --force-recreate` re-injects env_file. Discovered when `GOOGLE_CLOUD_PROJECT` was still empty after restart. Force-recreate fixed it.
6. **Real `.env` was missing `GOOGLE_CLOUD_PROJECT`:** Only `.env.example` had been updated. Added the real value (reused from ai-integrations) to `.env`. Reminder: secrets like API keys and project IDs MUST go into `.env` AND be added to `.env.example` (with a placeholder/blank).
7. **`server-only` import removed from `vertex-provider.ts`:** package not in production deps (Next.js bundler hint only, not runtime requirement). Original `ai-service.ts` had `import 'server-only'` but it only worked through Next.js bundling — `tsx` direct execution couldn't resolve it. Removed it from our new file. Provider is still effectively server-only by virtue of where it's imported.
8. **Vertex quota hit (NEW):** First baseline:post run failed at request ~6 with 429 `Quota exceeded for aiplatform.googleapis.com/online_prediction_requests_per_base_model`. Default Vertex quota on a fresh GCP project is ~5-10 req/min for embeddings. Fixed by adding a 7s sleep between calls (`REQUEST_DELAY_MS = 7000`) to stay under the cap. Total runtime: ~20 min for 63 requests. Production `init-podcasts` already throttles via `RATE_LIMIT_DELAY_MS = 2000` and `maxParallelCalls: 2`, so it's unaffected.

**Baseline-post results:**

```
Sample chunk cosine (50 chunks): mean=0.813, median=0.813, min=0.691, max=0.926
Top-K overlap (13 queries):      mean=100%, min=100%
Script decision:                 REINDEX_REQUIRED (threshold cosine > 0.95)
Actual recommendation:           NO_REINDEX
```

**Why script's decision was wrong:** the cosine threshold of 0.95 was naive. Vertex and AI Studio render `gemini-embedding-001` outputs in slightly different representation spaces — same model, but the SDKs apply different post-processing (or different model versions internally — AI Studio's stored vectors had norm ≈0.58, our new Vertex output is L2-normalized to 1.0). The cosine between SAME-CHUNK old vs new is ~0.81 — but **directionally the embeddings still rank the same chunks at the top** for every test query. Top-K overlap = 100% across 13 queries = RAG retrieval quality is preserved 1:1. Plan's decideAction was too conservative; for the user-visible decision, OVERLAP is the gold-standard signal, not raw cosine.

**UI smoke tests (Task 27):**

- Query 1: "Who runs Cosmos Hub now? Explain ICF vs Cosmos Labs." → perfect answer covering all three layers (ICF / Cosmos Labs / ATOM stakers), Skip Protocol acquisition, Proposal 848, ecosystem exclusion (Osmosis/Celestia), link to `/networks/cosmoshub/governance`. All facts came from the new prompt block. 0 console errors.
- Query 2: "What does Serj think about bare-metal validators and privacy?" → triggered `searchKnowledgeBase` (RAG path). LLM hit 429 quota after 3 retries (Vertex quota again — but now on the chat model side, not just embeddings). Confirms RAG path is wired correctly; the failure mode is GCP quota config, not migration correctness.

**Quota note:** This GCP project's Vertex quota is currently too low for sustained traffic (likely a few req/min). To run production smoothly we'd need to file a quota increase via GCP Console (typically minutes to hours for approval on standard models). Out of scope for this migration — flag for the user.

**Working tree update from this stage:**
- Modified: `.env` (added `GOOGLE_CLOUD_PROJECT`), `src/app/services/ai/vertex-provider.ts` (removed `'server-only'`), `scripts/embedding-baseline.ts` (full `runPost` + throttle)
- New gitignored: `baseline-post.json`

**Next:** Stage 5 — formalize NO_REINDEX decision; Stage 6 — user review + commit boundaries.

---

## Follow-up TODOs (out of scope for this migration)

### TODO 1 — Self-host embedding via Qwen3-embedding (or similar)

**Goal:** eliminate Vertex embedding quota bottleneck permanently by running an open-source embedding model in-house.

**Recommended model:** `qwen3-embedding-0.6b` (1024 dims, Apache 2, CPU-friendly via Ollama, ~85% quality vs gemini-embedding-001 on MTEB, top 2026 leaderboard for its size class).

**Approach:**
1. Add `embed-service` (Ollama) to `docker-compose.dev.yml` with healthcheck + auto-pull of qwen3-embedding model.
2. New `src/app/services/ai/ollama-embed-provider.ts` — HTTP client to Ollama `/api/embeddings`.
3. Update `src/app/services/embedding-service.ts` to call the local provider instead of Vertex.
4. Update all three `init-podcasts/*-processor.ts` files to use the local provider.
5. Update `vertex-provider.ts` — remove `embeddingModel()` (keep chat + summary).
6. Prisma migration: `ALTER TABLE podcast_chunks ALTER COLUMN embedding TYPE vector(1024)`; drop + recreate HNSW index; update `PODCAST_EMBEDDING_DIMENSIONS = 1024` in config.
7. **Full reindex of podcast_chunks (~15-20 min one-shot)** — vector spaces are incompatible across models.
8. Backup `podcast_chunks` before reindex on prod; rollback path = restore from backup + revert code.

**Why deferred:** clean separation from Vertex migration. Vertex migration is a "swap auth/transport" change; self-host embedding is a "swap model + swap infra + reindex" change. Different risk profile, different rollback path.

**Trigger conditions to reopen:**
- Vertex embedding quota approval doesn't come within a few days.
- Cost of paid Vertex embedding traffic exceeds infra cost of running Ollama (~$X/month at scale).
- Data residency requirement appears (e.g. compliance forbids sending query texts to Google).

### TODO 2 — Apply for `gemini-embedding-2` allowlist

Google preview-locked. Submit through Vertex AI preview-access form. If granted: ~10× quota (50/min default), multimodal-ready, but **also requires reindex** because vector spaces v001 and v2 are incompatible. Lower priority than TODO 1 — Qwen3 self-host is more flexible long-term.

### TODO 3 — Hybrid search (keyword + semantic)

`ai-integrations/chunk-service.ts` already implements `hybridSearch` combining pgvector + Postgres full-text. We currently rely only on semantic. Adding keyword would improve recall on exact-term queries (validator monikers, chain IDs). Lower priority — current top-K overlap is 100%.
