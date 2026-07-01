# Monero PoW Integration — Design Revision (2026-06-19)

**Status:** Revised after review (workflow 3-lens panel + Codex via agent-review).
See §12 for review resolutions.
**Supersedes:** §3 (data sources) and §5 (pool identification) of
`docs/plans/2026-04-29-monero-integration-design.md`. Other sections of the
original design remain valid unless contradicted here.
**Branch target:** fresh branch off `dev` (cherry-pick wip commit `90d83a5`).

---

## 1. Why this revision

The original design (2026-04-29) was implemented as a single wip commit
(`90d83a5`, branch `feat/monero-integration`) but never reviewed/merged. Live
investigation (2026-06-17…19) against the deployed indexer
(`indexer.monero.citizenweb3.com`) and the self-hosted monerod surfaced four
facts that invalidate parts of the original plan:

1. **Coinbase-fingerprint pool identification is non-viable for live
   attribution.** Evidence: 390 recent blocks (250 contiguous from tip + 140
   spread across ~250k depth) → `0` pool ASCII vanities, `0` non-empty residue
   after standard TLV tags; ~⅔ carry only a merge-mining tag (p2pool). Strongest
   test: the exact blocks SupportXMR and MoneroOcean **themselves** claim (via
   their pool APIs) still carry `0` tags in coinbase — even former tagging-era
   pools no longer mark `tx_extra`. Legacy ASCII tags (e.g. `/Heathcliff/`,
   `supportxmr`) DO exist on historical blocks (pre-~2021, visible in the
   indexer's `raw` JSONB) but not the recent operating window, so they are
   useless for forward attribution. The L1/L3 fingerprint machinery (`discover` +
   `cluster`) matches a signal that does not exist on current blocks → permanent
   "unknown". The one live on-chain pool signal is the merge-mining tag → p2pool
   fallback only (§3.3).
2. **Monero is private by design.** Stealth addresses + ring signatures + RingCT
   → no visible sender/receiver, no tx→pool-wallet linkage. Address attribution
   is impossible.
3. **Real indexer contract differs from the wip client.** `/api/v1/*`,
   `{data,pagination}` envelope, snake_case, `difficulty_hex` (hex string),
   offset pagination. The wip `indexer-client.ts` guessed all of these wrong.
4. **The indexer covers network metrics.** `/api/v1/supply` (cumulative
   emission — used for total supply; fees reported separately and are
   analytics-only, never summed into supply, see §6) and per-block
   `difficulty_hex`. No direct monerod RPC needed.

Pivot: pool attribution moves from **inferring the pool from block content**
(dead) to **asking pools which blocks they found** (authoritative,
on-chain-verified). VI collapses to a **single data source: the indexer**.

---

## 2. Decisions

| # | Decision | Choice |
|---|---|---|
| 1 | Scope | Both halves in one release |
| 2 | Data source | Single-source on the indexer; delete `rpc-client.ts` (verified safe — only 2 importers, both rewritten; distinct from shared `server/utils/json-rpc-client.ts`) |
| 3 | Pool share | On-chain block counting; pool `/stats` as supplementary live info |
| 4 | Pool coverage | Registry-driven, **verified-working** pools. v1 seeds **6 end-to-end-verified** (supportxmr, moneroocean, hashvault, c3pool, nanopool, p2pool — each pool's claimed block hash confirmed present + canonical in the indexer, via the **same Node `fetch` the job uses**). Adapters: generic cryptonote + nanopool (block_number/date) + p2pool.observer; per-pool isolated, dropped pools logged. Verification rigor: a `curl` 200 is NOT enough — herominers/2miners return data to `curl` but are Cloudflare-TLS-blocked / non-JSON to Node `fetch`, so they were dropped; gntl returned wrong-chain heights. More added data-only as APIs are Node-`fetch`-verified |
| 5 | History/windows | Persist per-block attribution + backfill; windows 24h/7d/30d/all |
| 6 | Unknown bucket | Shown as an explicit row, clamped ≥ 0 |
| 7 | p2pool | `p2pool.observer` API **only**. No on-chain merge-mining fallback (it would require coinbase consumption, contradicting #11). During an observer outage, p2pool blocks fall to the `unknown` bucket until it recovers |
| 8 | UI | Keep wip UI; rewire to the new data model (more than `monero-service.ts` — see §7) |
| 9 | Branch | Fresh branch off `dev`, cherry-pick `90d83a5` |
| 10 | Block match key | Match by **hash** (dedup + precision). Orphaned / non-canonical blocks are **excluded** from counts, not "caught" |
| 11 | Coinbase in VI | VI does **not** consume `coinbase_extra_hex` at all (no fingerprint, no merge-mining tag). Field stays in the indexer for future use |

---

## 3. Data sources (revised §3)

### 3.1 Indexer (`MONERO_INDEXER_BASE_URL`, Bearer `MONERO_INDEXER_API_TOKEN`)

| Need | Endpoint | Notes |
|---|---|---|
| Block list / detail | `GET /api/v1/blocks`, `/blocks/{id}` | `{data,pagination}`, `difficulty_hex`, `is_canonical`, `is_settled`, on-chain `timestamp` |
| Transactions | `GET /api/v1/transactions`, `/transactions/{id}` | tx-by-block, blocks UI |
| Supply | `GET /api/v1/supply` | `cumulative_emission_atomic` (+ `cumulative_fee_atomic` for analytics only) |
| Health | `GET /health` | `status`, `last_height`, `node_height`, `lag_blocks` — used for the runtime sanity guard (§5.2 `monero-network-info` / §8.1) |

Pagination: `limit` + `offset` + `order`. Envelope
`{ data:[...], pagination:{ limit, offset, order, has_more } }`.

### 3.2 Pool APIs (registry-driven)

Most pools run forks of `cryptonote-nodejs-pool` → shared shape:
`GET <base>/api/pool/blocks` (`{height,hash,ts,...}`), `GET <base>/api/pool/stats`
(`{pool_statistics:{hashRate,miners,...}}`). One generic adapter covers them;
non-standard pools get small custom adapters behind the same interface. **Each
pool fetch is isolated — one failure never breaks others; dropped pools are
logged (no silent truncation).**

### 3.3 p2pool

`p2pool.observer` API for the authoritative list of p2pool-found blocks
(normalized to `{height,hash,timestamp}`). **No on-chain fallback** — during an
observer outage, p2pool blocks are simply unattributed (→ `unknown`) until it
recovers. The merge-mining tag is the only live on-chain p2pool signal, but
reading it requires coinbase consumption, which decision 11 excludes.

### 3.4 Removed

Direct monerod JSON-RPC and `rpc-client.ts` deleted. Supply → `/api/v1/supply`;
difficulty/hashrate → tip block.

---

## 4. Client layer (`server/tools/chains/monero/`)

| File | Action |
|---|---|
| `indexer-client.ts` | **Rewrite**: `/api/v1/*`, unwrap `{data}`, offset pagination, snake→camel DTO, drop nonexistent `/header`,`/detail` |
| `rpc-client.ts` | **Delete** |
| `pool-apis.json` | **Expand** to verified-working pools (v1: 6 end-to-end-verified; more added as APIs are verified) |
| `pool-client.ts` | **New** generic cryptonote + p2pool.observer adapters → `{height,hash,timestamp}`; per-pool failures isolated |
| `identify-pool.ts` | **Delete** (no coinbase consumption; merge-mining fallback dropped) |

### 4.1 DTO mapping (indexer block → VI)

```
hash→hash  height→height(number)  timestamp→timestamp(unix s, ON-CHAIN)
num_txes→txCount  reward_atomic→reward(string)  block_size→size  block_weight→weight
miner_tx_hash→minerTxHash  is_canonical→isCanonical  is_settled→isSettled
difficulty_hex → difficulty (BigInt)   // see precision rule below
```

**Precision (H5):** `difficulty_hex` exceeds 2^53. Parse with
`BigInt(normalizedHex)` end-to-end — **never** `Number`/`parseInt`. Normalize
0x-prefix; if missing/empty → skip (do not write 0/NaN). Unit test with a real
tip-difficulty hex asserting no precision loss.

---

## 5. Pool attribution pipeline (revised §5)

### 5.1 Schema additions (Prisma)

Keep `MiningPool`, `MiningPoolStats`, `ChainHashrateSnapshot`,
`Tokenomics.totalSupply`. Add the per-block backbone **with named inverse
relations** (house style — `prisma validate` fails without them):

```prisma
model MoneroBlockAttribution {
  id             Int      @id @default(autoincrement())
  chainId        Int      @map("chain_id")
  height         Int
  blockHash      String   @map("block_hash")
  poolId         Int      @map("pool_id")
  source         String   @db.VarChar(32)            // AttributionSource union: pool_api | p2pool_observer
  blockTimestamp DateTime @map("block_timestamp") @db.Timestamptz(6)  // ON-CHAIN canonical ts → window membership
  poolReportedAt DateTime? @map("pool_reported_at") @db.Timestamptz(6) // pool-API ts, provenance only
  isCanonical    Boolean  @default(true) @map("is_canonical")          // re-verified each run
  isConflicted   Boolean  @default(false) @map("is_conflicted")        // 2+ pools claim this hash → excluded from named counts
  createdAt      DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt      DateTime @updatedAt @map("updated_at") @db.Timestamptz(6)

  chain Chain      @relation("chain_monero_block_attributions", fields: [chainId], references: [id])
  pool  MiningPool @relation("mining_pool_attributions", fields: [poolId], references: [id])

  @@unique([chainId, blockHash])
  @@index([chainId, blockTimestamp])
  @@index([chainId, poolId, blockTimestamp])
  @@index([chainId, isCanonical, isConflicted, blockTimestamp])
  @@map("monero_block_attribution")
}
```

Inverse fields to add: `Chain.moneroBlockAttributions MoneroBlockAttribution[]
@relation("chain_monero_block_attributions")` and
`MiningPool.attributions MoneroBlockAttribution[] @relation("mining_pool_attributions")`.

Why a table: pool APIs are **ephemeral** (recent-N only). Long windows
(7d/30d/all) are only computable from attribution captured at poll time. The
per-block grain is required for reorg invalidation (§5.2), which settles the
"aggregates instead?" question — aggregates cannot un-count an orphaned block.

`MiningPool.identificationMethod` ∈ `pool_api | p2pool_observer | unknown`. The
allowed `source` / `identificationMethod` values are defined once as a shared TS
union (`AttributionSource`) used by both the attribution upsert and the pool seed
— not free-form strings — to prevent silent mis-bucketing typos.
`fingerprint`/`detectorJson` columns + `@@index([chainId, fingerprint])` are
retained as **legacy/unused**: leave the Prisma fields **uncommented** (only
annotate with a `//` legacy note) — commenting them out would make
`migrate dev` emit a `DROP COLUMN`/`DROP INDEX` (the CLAUDE.md hazard). Dropping
them is a separate, explicit migration, deferred.

### 5.2 Jobs (`server/jobs/`)

| Job | Action | Cadence |
|---|---|---|
| `monero-pool-discover` | **Delete** | — |
| `monero-pool-cluster` | **Delete** | — |
| `monero-pool-identify` | **Delete** (merge-mining fallback dropped; observer covers p2pool) | — |
| `monero-pool-attribution` | **New.** Per registry pool + observer: fetch recent found blocks `{height,hash}`. Batch-confirm against the indexer by **paging the block list once per height range into an in-memory `hash → {isCanonical, blockTimestamp}` map** (not N single lookups). Upsert `MoneroBlockAttribution` with `blockTimestamp` = indexer canonical block ts, `poolReportedAt` = pool ts, `isCanonical` from indexer. **Re-verify the most recent N=500 rows each run** using a **dedicated** canonical map (paged over those rows' own height span — independent of what pools reported, so the depth is a fixed N, not data-dependent) and set `isCanonical` **both ways** (re-canonicalize on chain switch-back); rows older than the N-row span are treated as settled. **Conflict rule (Codex F1):** if `(chainId, blockHash)` already exists with a *different* `poolId`, do **not** create a second row and do **not** overwrite `poolId`; set the **persistent** `isConflicted=true` flag on the existing row (keep its original `poolId` for provenance) and log. `isConflicted=true` rows are excluded from every named-pool count, so the block falls into `unknown` via the residual (§5.2 pool-stats). External API noise can never silently move a block between pools. First run: backfill to each API's depth (budgeted). Same-run conflicts (2+ pools claim one new hash) are created `isConflicted=true`. DB writes are **batched** (one existence `findMany`, then `createMany` + grouped `updateMany` — not N round-trips). Also upsert `MiningPool` from registry metadata. (Live `/stats` via `fetchPoolStats` is supplementary and **not persisted** — no schema sink; consumed by a service/UI on demand.) | every 10 min |
| `monero-pool-stats` | **Rewrite.** Window membership by **block HEIGHT** — one clock for numerator and denominator (Codex/stats-H1). `lowerHeight` = `tipHeight − {720, 5040, 21600}` for 24h/7d/30d. `networkBlocks = tipHeight − lowerHeight` is the **EXACT** canonical count (Monero heights are contiguous — one canonical block per height — so this is not an estimate). `poolBlocks` (per named pool) = `MoneroBlockAttribution` count with `isCanonical=true AND isConflicted=false AND height ∈ [lowerHeight, tipHeight]`. `share = poolBlocks/networkBlocks`. `unknown = max(0, networkBlocks − Σ poolBlocks)` (clamp + **log if it would have gone negative**) — this residual absorbs both unattributed and `isConflicted` blocks. `hashrateEstimate = share × AVG(ChainHashrateSnapshot.hashrate over the window)` (hourly snapshots; 24h may use latest; for `all` write `hashrateEstimate='0'` — the field is non-null — and **hide it in the UI**, never show an all-time hashrate). `all` window: `lowerHeight` = earliest attribution height ("since tracking start"), NOT the whole chain. **Every** named pool is upserted each run (including 0 blocks) so a pool going quiet can't leave a stale row (Codex/stats-H2). Idempotently upsert the `unknown` pool row; write `hashrateEstimate='0'` when no snapshot exists yet. | every hour |
| `monero-network-info` | **Rewrite.** Tip block `difficulty_hex` → `hashrate=(difficulty/120n)` (BigInt) → `ChainHashrateSnapshot`. Supply → `Tokenomics.totalSupply` (see §6). **Runtime sanity guard:** if tip height is implausible vs `/health.node_height` (e.g. the 999999 string-sort artifact), log-and-skip — never persist a bogus tip/supply. No RPC. | every hour |

### 5.3 Unknown bucket

Reserved `MiningPool` (`slug='unknown'`, `identificationMethod='unknown'`,
`isVerified=false`), idempotently upserted at the start of each
`monero-pool-stats` run. Its `MiningPoolStats` row uses the same
`windowStart`/`windowEnd` as real pools so shares sum to 100%.

---

## 6. Network metrics half

- Hashrate = tip `difficulty / 120n` (BigInt; Monero target 120 s) →
  `ChainHashrateSnapshot` hourly.
- **Supply (H1):** `Tokenomics.totalSupply = cumulative_emission_atomic` —
  **raw atomic (piconero) string, emission-only.**
  - **Do NOT** divide by `1e12`: the app divides `totalSupply` by
    `10 ** coinDecimals` (=12) at read time (`server/jobs/update-fdv.ts`,
    `network-overview.tsx`). Storing XMR would divide twice.
  - **Do NOT** add `cumulative_fee_atomic`. Verified against the indexer source
    (`chain-data-indexer` `src/runner/supplyBackfill.ts`):
    `cumulative_emission_atomic = Σ monerod get_coinbase_tx_sum.emission_amount`
    (base block rewards = newly minted coins); `cumulative_fee_atomic = Σ fee_amount`
    is stored **separately**. Circulating XMR supply = cumulative base emission.
    Fees add **no** new supply — they are existing coins transferred from spenders
    to the miner (spent as inputs, re-output in the coinbase; net-zero). Summing
    them overstates supply by the cumulative fee total (this is the bug in the wip
    `monero-network-info.ts`, which summed both). `cumulative_fee_atomic` stays
    analytics-only.
  - **Hard pre-merge gate** (not deferred): `stored_piconero / 1e12` must match a
    current explorer XMR circulating supply within tight tolerance — this is the
    only empirical disambiguation, since emission-only vs emission+fee differ by
    exactly the cumulative fee total. **✅ Confirmed 2026-06-19:** the live latest
    supply checkpoint = `18766842146869265440` piconero ÷ 1e12 ≈ **18.77M XMR**,
    matching real Monero circulating supply — emission-only validated.
- Blocks UI reads indexer `/api/v1/blocks` (paged) via `monero-service.ts`.

---

## 7. UI (rewire)

Keep wip components, but the rewire is **more than `monero-service.ts`**: in the
wip commit, `src/app/[locale]/networks/[name]/blocks/pow-blocks.tsx` and
`src/app/[locale]/mining-pools/[poolSlug]/page.tsx` import `identifyPool` /
`listMoneroBlocks` **directly**, bypassing the service. Route all Monero data
through `monero-service.ts` and rewire those components, or they keep calling the
deleted/old paths and render unknowns. Add unknown-row ordering, null-logo
handling, 100% summation.

**i18n (M4):** the wip is already out of parity (en=20 keys, pt=ru=19).
Reconcile en/pt/ru to identical key sets and add new labels (unknown row, window
labels) to all three. "Identical key count across locales" is a hard acceptance
check.

---

## 8. Indexer-side dependencies (separate ticket → indexer dev)

`chain-data-indexer`, branch `monero-indexer`:

1. **BLOCKER — list `ORDER BY height` numeric (BIGINT), not text.** `order=desc`
   returns 999999 (string sort) not the real tip. Breaks tip/latest paging for
   `network-info` and `/supply`. VI adds a runtime guard (§6) so a not-yet-fixed
   indexer cannot poison snapshots, but correct data needs this fix.
   **✅ RESOLVED 2026-06-19** (commits `b5a270c8` + `a6bd42fe`): root cause was a
   `height::text` SELECT alias shadowing the BIGINT column in `ORDER BY`; fixed by
   table-qualifying the sort + a defensive BIGINT migration (`006-height-bigint.sql`).
   Verified live: `desc`=tip, `asc`=[0,1,2]. (A get_info `height` vs `height-1`
   crash bug was fixed in the same pass.) Keep the VI runtime guard regardless.
2. `coinbase_extra_hex` — done (off VI's critical path now).
3. `/api/v1/stats` hangs (proxies live to node) — optional; VI derives from tip.
4. Push deployed code to branch `monero-indexer` (deploy diverged).

---

## 9. Implementation stages

1. **Branch + schema.** Fresh branch off `dev`. Cherry-pick `90d83a5`
   **including `prisma/migrations/20260429154100_add_monero_pow_models/`**, then
   verify the dir is present and `prisma migrate status` is clean (else Prisma
   diffs against an empty baseline and regenerates the whole Monero base,
   corrupting history). Only then add `MoneroBlockAttribution` (+ named inverse
   relations on Chain/MiningPool) and seed the `unknown` pool. Leave
   `MiningPool.fingerprint`/`detectorJson` + their index **uncommented**
   (legacy `//` annotation only). `prisma validate` → `migrate dev`
   (additive-only; human-review SQL for unexpected DROPs and stray vector-index
   drops) → `prisma generate`.
2. **Client.** Capture & commit a redacted real `/api/v1/blocks` +
   `/api/v1/supply` fixture. Rewrite `indexer-client.ts` (BigInt difficulty,
   `{data,pagination}` envelope, offset paging) with a snake→camel DTO unit test
   against the fixture. Delete `rpc-client.ts`. Add `pool-client.ts` + expanded
   `pool-apis.json` + the shared `AttributionSource` union.
3. **Jobs.** Delete `discover`/`cluster`/`identify`; add `monero-pool-attribution`
   (batch confirm + reorg re-verify + conflict→unknown); rewrite
   `monero-pool-stats` (canonical-only, clamped unknown, bounded `all`,
   window-avg hashrate, `'0'` hashrate for `all`) + `monero-network-info` (BigInt,
   atomic emission-only supply, sanity guard). Register the three Monero jobs
   (`monero-network-info`, `monero-pool-attribution`, `monero-pool-stats`) in
   `server/indexer.ts` `specialTasks` + `task-worker.ts` dispatch. No env gate —
   the §8.1 ordering fix is deployed, so they run alongside the rest.
4. **UI rewire + docs.** Repoint `monero-service.ts` AND the two direct-import
   components (§7). Reconcile i18n ×3. Update
   `server/tools/chains/monero/AGENTS.md` to the single-source contract (deleted
   rpc-client, new attribution job, removed fingerprint/identify).
5. **Verify.** Stage-1/2 offline gate (§11) first; then `yarn lint`, `yarn
   build`, run jobs against the live indexer (after §8.1), sanity SQL, supply vs
   known explorer checkpoint.

---

## 10. Risks / limitations

- **Pool API fragility.** Several external pool APIs (v1: 6 verified). Mitigation:
  generic adapter + per-pool isolation + logged drops; only end-to-end-verified
  pools are registered (unverified/wrong-chain URLs dropped).
- **Window fill-in.** 7d/30d/all accurate only after attribution accumulates;
  `all` = "since tracking start" (bounded numerator+denominator, §5.2). Backfill
  reduces but cannot eliminate.
- **Reorg invalidation.** Handled: `isCanonical` re-verified each run; stats
  count canonical only; `unknown` clamped ≥ 0.
- **p2pool depends solely on `p2pool.observer`.** No on-chain fallback; an
  observer outage temporarily routes p2pool blocks to `unknown` (self-heals on
  the next successful poll).
- **Conflicting pool claims** on one `blockHash` are routed to `unknown` (not
  silently overwritten) — see §5.2 conflict rule.
- **Offset pagination over a growing/reorg set** can skip/dup at the boundary;
  dedup is by `@@unique([chainId, blockHash])`.
- **Hard dependency on indexer ordering fix** (§8.1) for correct tip-anchored
  data; runtime guard prevents bad persistence meanwhile.
- **Supply correctness is money-sensitive** — verify vs a known checkpoint.

---

## 11. Acceptance criteria

- Monero in `/networks`; overview shows live hashrate + supply; blocks table
  paginates real indexer data.
- `mining-pools` lists pools with `share% / blocks` per window (+
  `hashrateEstimate` for 24h/7d/30d; omitted/hidden for `all`) + an `unknown`
  row; shares sum to 100%; `unknown ≥ 0`.
- `Tokenomics.totalSupply` stored as **raw atomic emission-only**; FDV/supply UI
  render correctly (no double 1e12); supply checkpoint matches an explorer figure.
- `MoneroBlockAttribution` populates from ≥2 source types (`pool_api` +
  `p2pool_observer`); `@@unique([chainId, blockHash])` enforced; conflicting
  claims routed to `unknown`; reorged blocks flipped non-canonical and excluded.
- `prisma validate` passes; `yarn lint` + `yarn build` clean; i18n identical key
  counts across en/pt/ru.
- No direct monerod RPC remains. `server/tools/chains/monero/AGENTS.md` updated
  to the single-source contract.
- **Stage 1–2 offline gate** (verifiable before §8.1 lands): `prisma validate` +
  additive-only migrate SQL (human-reviewed, no unexpected DROP) + `prisma
  generate` clean + DTO/BigInt unit test passes against a committed
  `/api/v1/blocks` + `/api/v1/supply` fixture + `rpc-client.ts` deleted + `yarn
  build` green. End-to-end acceptance is evaluated **after** the §8.1 ordering
  fix is deployed (done) — the Monero jobs then run alongside the rest.

---

## 12. Review resolutions (2026-06-19)

Workflow panel verdicts: feasibility `ship-with-changes`, data-model
`needs-rework`, scope `ship-with-changes`. Codex (agent-review) F1–F5. All
HIGH/MEDIUM findings folded above.

| Finding (source) | Resolution |
|---|---|
| Supply units double-1e12 + fee double-count (Codex F1, data-model) | §6: raw atomic, emission-only; verify checkpoint |
| Reorg/orphan never invalidated; foundAt≠on-chain ts (data-model, Codex F3, feasibility) | §5.1 `isCanonical`+`blockTimestamp`; §5.2 re-verify + canonical-only + clamp |
| `all` window denominator = whole chain (data-model, feasibility) | §5.2 bound `all` to earliest attribution ts |
| Prisma missing inverse relations (all lenses, Codex F2) | §5.1 named inverse fields on Chain/MiningPool |
| difficulty precision >2^53 + ordering guard (feasibility, data-model) | §4.1 BigInt; §6 runtime sanity guard |
| hashrateEstimate dimensional (data-model, Codex F4) | §5.2 window-average; omit for `all` |
| UI rewire > monero-service.ts (Codex F5, feasibility) | §7 rewire pow-blocks + pool detail |
| Confirm-step batching (feasibility) | §5.2 paged in-memory hash→canonical map |
| i18n parity drift 20-vs-19 (scope) | §7 reconcile + hard acceptance check |
| blockHash uniqueness scope (data-model) | §5.1 `@@unique([chainId, blockHash])` |
| Unknown pool seed + no-snapshot fallback (data-model, scope) | §5.2/§5.3 idempotent upsert + '0' fallback |
| Dead fingerprint code/columns (scope) | §5.1 jobs deleted; columns kept **uncommented** with legacy `//` note (commenting would DROP) |
| Dependency gate (scope) | §9 jobs flag-off until §8.1 confirmed |
| 10+ pools YAGNI (scope) | Resolved in Stage 2: registry is verified-driven — 6 pools pass an end-to-end hash↔indexer attribution check via Node `fetch`; curl-only-OK / wrong-chain URLs dropped. More added data-only as verified |
| rpc-client.ts deletion safe (scope) | Confirmed: 2 importers, distinct from shared client |

### Round 2 — final review (workflow + Codex), all folded

Workflow verdicts: coherence / correctness / readiness all `ship-with-changes`.
Codex F1–F3.

| Finding (source) | Resolution |
|---|---|
| **Supply emission-only justification wrong + unverified** (correctness HIGH) | §6: verified from indexer source (`supplyBackfill.ts` → `cumulative_emission_atomic = Σ emission_amount` = base reward; fee stored separately). Emission-only **confirmed correct**; justification rewritten; checkpoint made a hard pre-merge gate |
| **Decision 7 vs 11 contradiction** — merge-mining fallback needs coinbase, but VI doesn't consume it (coherence HIGH) | Dropped the merge-mining fallback. p2pool = observer-only; `identify-pool.ts` deleted; `merge_mining` enum removed; §3.3/§4/§5.1/§5.2/§10 updated |
| **Conflicting pool claims overwrite silently** (Codex F1 HIGH) | §5.1 persistent `isConflicted` flag added; §5.2 conflict rule sets it on the existing row (no overwrite); pool-stats counts named pools as `isCanonical AND NOT isConflicted` → conflicted blocks fall into `unknown`. Re-verified after Codex round-2 needs-work |
| hashrateEstimate `all`-window contradictory (Codex F2, coherence MED) | §5.2 write `'0'` + hide in UI; §11 acceptance excludes `all` |
| `≥3 sources` impossible (merge_mining down-only) (coherence MED) | §11 → `≥2 source types` (pool_api + observer) |
| Stale `monero/AGENTS.md` (Codex F3 MED) | §9 stage 4 adds AGENTS.md update task |
| Migration base = full dir `…_add_monero_pow_models`; cherry-pick must include it before `migrate dev` (readiness MED) | §9 stage 1 explicit ordering + status check |
| `MiningPool` legacy columns: "commented" would DROP (readiness MED) | §5.1/§9: keep fields uncommented, annotate only |
| Reorg re-verify depth unscoped (correctness LOW) | §5.2 bounded N ≥ deepest practical reorg; older rows settled |
| Sanity-guard pointer §6 → actually §5.2/§8.1 (coherence LOW) | §3.1 repointed |
| `is_settled` mapped but unused (coherence LOW) | display/future-use; counting uses `isCanonical` only |
| Source enum free-form drift (readiness LOW) | §5.1/§9 shared `AttributionSource` TS union |
| No stage-1/2 done-definition (readiness LOW) | §11 offline gate added |
| Commit a real response fixture for DTO test (readiness LOW) | §9 stage 2 captures `/blocks`+`/supply` fixture |
