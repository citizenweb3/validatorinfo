# Monero Module

## Purpose

Monero (PoW, mainnet) integration. Ecosystem `monero`, `hasValidators: false` —
no stake/validators by design. Surfaces network metrics (height, hashrate,
difficulty, supply) and **mining-pool share analytics**.

> Authoritative design: `docs/plans/2026-06-19-monero-pow-redesign-design.md`.
> The older `2026-04-29-monero-integration-*` docs are superseded.

## Architecture (single-source on the indexer)

VI talks to **one** infra dependency for chain data — the deployed indexer at
`MONERO_INDEXER_BASE_URL` (`/api/v1/*`, Bearer `MONERO_INDEXER_API_TOKEN`) — plus
the pools' own public APIs for attribution. **There is no direct monerod RPC**
(`rpc-client.ts` was removed); supply, blocks and difficulty all come from the
indexer.

**Pool identification does NOT use coinbase `tx_extra`.** That signal is dead on
modern blocks (verified: 0 ASCII/residue across hundreds of blocks, incl. pools'
own claimed blocks). Instead: poll each pool's API for the blocks IT found, match
by hash against the indexer's canonical set, and count per-pool share. VI does
**not** consume `coinbase_extra_hex` at all (design decision 11).

## Files

| File | Purpose |
|---|---|
| `constants.ts` | `MONERO_BLOCK_TIME_SECONDS = 120`, `MONERO_INDEXER_PAGE_SIZE = 1000`, `MONERO_BACKFILL_START_HEIGHT` |
| `indexer-client.ts` | Typed client for `/api/v1/*`: `listMoneroBlocks({limit,offset,order})` (→ `{items,hasMore,nextOffset}`), `getMoneroBlock`, `getTipBlock` (first canonical), `listMoneroSupply`/`getLatestSupply`, `getHealth`, `parseDifficultyHex` (→ `bigint \| null`, never Number). `{data,pagination}` envelope, snake→camel DTO, retry/timeout |
| `pool-parse.ts` | Pure parsers (unit-tested): `parseCryptonoteBlocks`, `parseNanopoolBlocks`, `parseObserverBlocks` → `{height,hash,timestamp(s)}`; throws on all-unparseable (no silent truncation) |
| `pool-client.ts` | `getPoolRegistry`, `fetchPoolBlocks` (dispatch by type, throws→caller isolates), `fetchPoolStats` (best-effort, type-aware), `sourceForPool` |
| `pool-apis.json` | Registry of **end-to-end-verified** pools (v1: supportxmr, moneroocean, hashvault, c3pool, nanopool, p2pool). Each verified via Node `fetch` + hash↔indexer cross-check |
| `attribution-source.ts` | Shared `AttributionSource`/`IdentificationMethod` unions + `UNKNOWN_POOL_SLUG/NAME` |
| `methods.ts` | `ChainMethods`: `...nullTxMetrics` + null/empty stubs (no validators/staking/governance) |
| `__fixtures__/` | Real captured API responses + `dto.check.ts` (`npx tsx …/dto.check.ts`) |

## Indexer jobs (`server/jobs/`)

| Job | Schedule | What it does |
|---|---|---|
| `monero-network-info` | hourly | Tip-block `difficulty/120n` (BigInt) → `ChainHashrateSnapshot`; latest `/supply` `cumulative_emission_atomic` (RAW ATOMIC, **emission-only**, no `/1e12`, no `+fee`) → `Tokenomics.totalSupply`. Guards: skip on null difficulty, height floor (`< 1M` = ordering artifact), `abs(tip − node_height)` band, supply monotonic |
| `monero-pool-attribution` | every 10 min | Poll each registry pool + p2pool.observer (isolated) → batch-confirm hashes against the indexer canonical set → upsert `MoneroBlockAttribution`. Conflicting claims on one hash → `isConflicted=true` (kept, excluded from named counts). Bounded two-way reorg re-verify. Batched DB writes |
| `monero-pool-stats` | hourly | Per window {24h,7d,30d,all}: `networkBlocks = tipHeight − lowerHeight + 1` (EXACT — heights contiguous), `poolBlocks` = canonical, non-conflicted attributions in the same height range; `share`, window-avg `hashrateEstimate` (`'0'` for all). Unknown/solo = clamped residual. Upserts every named pool each run |

Deleted (do NOT re-add): `monero-pool-discover`, `monero-pool-cluster`,
`monero-pool-identify`, `rpc-client.ts`, `identify-pool.ts` — all coinbase-
fingerprint machinery, proven non-viable.

## Data model

`ChainHashrateSnapshot` (hashrate/difficulty time series), `Tokenomics.totalSupply`
(raw atomic, emission-only — UI divides by `10^coinDecimals`=12), `MiningPool`,
`MiningPoolStats` (windowed share), `MoneroBlockAttribution` (per-block
hash→pool, `isCanonical`/`isConflicted`). UI reads these via `monero-service.ts`.

## Constraints

- Never fill `Validator` (no validators — PoW).
- `totalSupply` is **raw atomic piconero, emission-only** — never add fees, never
  pre-divide. FDV/UI divide by `10^coinDecimals`.
- Difficulty must be parsed with `BigInt` (cumulative exceeds 2^53), never Number.
- Pool registry holds only Node-`fetch`-verified endpoints (a `curl` 200 is not
  enough — some pools are Cloudflare-TLS-blocked to undici).

## Testing

- DTO/parser check: `npx tsx server/tools/chains/monero/__fixtures__/dto.check.ts`
- Indexer smoke: `GET {MONERO_INDEXER_BASE_URL}/api/v1/blocks?order=desc&limit=1` (Bearer)
- DB checks: `chain_hashrate_snapshots`, `tokenomics`, `monero_block_attribution`,
  `mining_pool_stats` `WHERE chain_id = (SELECT id FROM chains WHERE name='monero')`
- Run a job manually: `validatorinfo-indexer-testing` skill.
