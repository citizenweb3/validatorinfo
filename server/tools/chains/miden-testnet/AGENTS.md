# Miden Testnet Module

## Purpose

Минимальная интеграция Miden testnet (STARK-based zkVM rollup, client-side proving, privacy-preserving smart contracts) в ValidatorInfo. Ecosystem: `miden` (standalone — после ребрендинга `0xPolygonMiden` → `0xMiden` отделён от Polygon). `hasValidators: false`.

## Why this module is small

Testnet работает с централизованным block producer (единый `validator_key` в каждом header'е), без PoS и без validators-as-stakers. Стандартная Cosmos-shape `ChainMethods` неприменима. В Stage 1 реализован только `getChainUptime`; остальные методы — null/empty stubs.

## Data source

- **citizenweb3 Miden indexer** (`https://indexer.miden-testnet.citizenweb3.com`, Bearer auth)
  - `GET /api/v1/stats` — `last_block`, `total_blocks`, `total_transactions`, `total_notes`, `total_nullifiers`, `total_accounts`, `latest_block_timestamp`
  - `GET /api/v1/blocks?limit=&offset=&sort=block_num&order=desc` — paginated block list
  - `GET /api/v1/blocks/:block_num` — block detail (включая `raw_block_bytes`)
  - Known issue: server игнорирует `sort/order` и возвращает `block_num` лексикографически — backend починит; explorer передаёт параметры как если бы они работали.
- **gRPC** (`grpc.miden.citizenweb3.com:443`, service `rpc.Api`, reflection enabled) — НЕ используется в Stage 1/2. Резерв для live chain tip / mempool (методы `Status`, `GetBlockHeaderByNumber`, `SyncState`, etc.).

URL'ы хранятся в `params.ts` через `nodes` массив с типами `'grpc'` и `'indexer'`. Bearer-токен — в `MIDEN_INDEXER_API_TOKEN` env (конвенция `<CHAIN>_INDEXER_API_TOKEN`).

## Files

| File | Purpose |
|---|---|
| `types.ts` | `MidenStats`, `MidenBlock`, `MidenBlocksResponse` — schema indexer REST (verified live 2026-05-12) |
| `get-chain-uptime.ts` | Единственный рабочий метод: возвращает `{lastUptimeUpdated, uptimeHeight=Number(last_block), avgTxInterval=medianBlockTimeMs│fallback 1000ms, blockTime=medianBlockTimeMs│null}` |
| `methods.ts` | `ChainMethods` объект: `getChainUptime` + null/empty stubs + spread `nullTxMetrics` |

## Stage boundaries

- **Stage 1** (this PR): chain registration (`params.ts`, `methods.ts`) + `getChainUptime` через indexer.
- **Stage 2**: UI integration для blocks — `src/app/services/miden-indexer-api/*`, `getMidenBlocks` в `blocks-service.ts`, `miden-block-information.tsx`, JSON/expanded ветки, `network-overview.tsx` ветка, i18n keys.
- **Stage 3** (deferred): tx-metrics jobs + UI — когда indexer начнёт индексировать транзакции (сейчас `total_transactions=0`).

См. `docs/plans/2026-05-12-miden-testnet-integration-design.md`.

## Constraints

- `hasValidators: false` — пропускает 7 validator-centric jobs (centralized block producer, нет staking).
- НЕ менять Prisma schema под Miden — нет attributable validators / stakers.
- НЕ заполнять `Validator` table — single `validator_key` на все блоки testnet'а.
- Tx-метрики (`getTotalTxs`, `getTxsLast24h`, `getTps`, `getAvgFee`) возвращают `null` через `nullTxMetrics` пока indexer не индексирует транзакции.
- `FALLBACK_BLOCK_TIME_MS = 1000` в `get-chain-uptime.ts` — используется только для `avgTxInterval`. `blockTime` остаётся `null` если sampling провалился (по logos-pattern).

## Versioning

`chainId: 'miden-testnet-v0.13'` — provisional, соответствует node v0.13.4. Обновить когда Miden опубликует официальный identifier или genesis-commitment-based id.

## Indexer lag

На момент 2026-05-12: `last_block=82599` в indexer'е vs ~2.4M на чейн-типе через gRPC `Status`. Backend догоняет. Explorer-логика корректна в обоих состояниях — отображает то, что indexer успел проиндексировать.
