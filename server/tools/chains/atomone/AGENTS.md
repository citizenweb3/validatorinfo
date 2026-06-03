# AtomOne Module

## Purpose

Интеграция AtomOne mainnet в ValidatorInfo через citizenweb3 indexer. Cosmos-SDK chain (Tendermint consensus, bech32 prefix `atone`, native denom `uatone`, 6 decimals).

## Why this module is thin

Большинство методов наследуется от `cosmoshub/methods.ts` через spread — AtomOne использует ту же Cosmos SDK RPC/REST схему, и универсальные методы (`get-nodes`, `get-staking-params`, `get-apr`, `get-chain-uptime`, etc.) работают chain-agnostic через `fetchChainData(dbChain.name, ...)` поверх `params.ts → nodes`.

Переопределены только методы, которые завязаны на indexer:
- `getProposals` / `getProposalParams` — AtomOne использует ту же proposal pipeline, что и cosmoshub (исторически кастомные).
- `getTotalTxs` / `getTxsLast24h` / `getTps` / `getAvgFee` — питаются из `atomone-indexer-api` (`/api/v1/txs/stats`, `/api/v1/blocks`, `/api/v1/txs` соответственно).

## Data source

- **citizenweb3 AtomOne indexer** (`https://indexer.atomone.citizenweb3.com`, `x-api-key` auth)
  - `GET /api/v1/blocks` — листинг блоков (with `limit`, cursors)
  - `GET /api/v1/blocks/{height}` — детали блока (включает `tx_count`, `proposer_address`, hashes)
  - `GET /api/v1/blocks/stats` — `total_blocks`, `avg_block_time`, etc.
  - `GET /api/v1/txs` — листинг транзакций
  - `GET /api/v1/txs/{hash}` — детали + `events[]` + `messages[]`
  - `GET /api/v1/txs/{hash}/raw` — оригинальный raw_tx JSON для JSON tab
  - `GET /api/v1/txs/stats` — `total_txs`
  - `GET /api/v1/health` — публичный, без auth (sanity check)
- **Public RPC / REST** — стандартный Cosmos SDK, конфигурируется через `nodes` массив в `params.ts`.

Ключ — в `ATOMONE_INDEXER_API_KEY` env (header `x-api-key`).

## Files

| File | Purpose |
|---|---|
| `methods.ts` | `ChainMethods` — spread cosmosChainMethods + 6 override |
| `get-total-txs.ts` | wrap `atomoneIndexer.getTxsStats()` → `BigInt` |
| `get-tps.ts` | блочное окно (TPS_BLOCK_WINDOW=100), считает `tx_count / time_diff` |
| `get-avg-fee.ts` | `NATIVE_FEE_DENOM = 'uatone'`, AVG_FEE_TX_WINDOW=100 |
| `get-txs-last-24h.ts` | `db.chainTxDailySnapshot` lookup (заполняется индексером) |

`get-proposals.ts` / `get-proposal-params.ts` — стандартный Cosmos SDK governance v1, использует REST `/cosmos/gov/v1/proposals`.

## UI surface

Block / Tx pages используют отдельные компоненты `atomone-block-information.tsx`, `atomone-tx-information.tsx`, `expanded-atomone-tx-information.tsx`, `miden-json-tx-information.tsx` → AtomOne не разделяет UI с cosmoshub, чтобы избежать кросс-зависимостей в типах (`AtomoneTxDetail` vs `CosmosTxDetail`).

Dispatcher pattern (одинаковый везде):
```tsx
if (chain?.name === 'cosmoshub') return <CosmosX ... />;
if (chain?.name === 'atomone') return <AtomoneX ... />;
```

## Service layer

`@/services/atomone-indexer-api` — typed wrapper над indexer endpoints. Зеркалит `@/services/cosmos-indexer-api`, но с собственными типами (поля могут расходиться — see `types.ts`).

`BlocksService.getAtomoneBlocks` / `TxService.getAtomoneTxs` — пагинация + проекция в `BlockItem` / `TxItem` для табличных страниц.

## Constraints

- AtomOne indexer возвращает блоки только by-height — детальная страница `/networks/atomone/blocks/[hash]` редиректит на by-height; компонент проверяет `/^\d+$/.test(hash)`.
- **Fee denom — `uphoton`, не `uatone`.** AtomOne использует двухтокенную модель: ATONE (`uatone`, 6 dec) — staking + governance, PHOTON (`uphoton`, 6 dec) — gas/fees. `get-avg-fee.ts` фильтрует по `NATIVE_FEE_DENOM = 'uphoton'`. UI в `total-txs-metrics.tsx` показывает `'PHOTON'` для AtomOne (а не chain.params.denom). Если AtomOne добавит multi-denom fees — расширить filter.
- AtomOne НЕ переопределяет `getChainUptime` — cosmoshub-версия дёргает RPC `/status` через `fetchChainData(dbChain.name, ...)` и подходит как есть.
- Endpoint detail path: `/api/v1/blocks/height/{h}` (не `/api/v1/blocks/{h}` — 404).

## Versioning

`chainId: 'atomone-1'` (mainnet). Pattern: новый chain entry на breaking-restart, старый помечается `tags: ['Deprecated']`.
