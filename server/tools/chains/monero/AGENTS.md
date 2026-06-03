# Monero Module

## Purpose

Интеграция Monero (PoW, mainnet) в ValidatorInfo. Ecosystem: `monero`. `hasValidators: false` — у Monero нет stake/validators по дизайну (PoW). Цель — отображать сетевые метрики (height, hashrate, difficulty, supply) и активность mining pools.

## Why this module is small

PoW chain. Стандартная Cosmos-shape `ChainMethods` (validators, staking params, slashing, governance, votes, rewards) неприменима — нечего возвращать. Реализация = network-info job + помощник идентификации pools. Все validator/staking методы — null/empty stubs.

## Data sources

- **Self-hosted Monero RPC** (`https://rpc.monero.citizenweb3.com/json_rpc`)
  - Auth: `Authorization: Bearer ${MONERO_RPC_TOKEN}` (env)
  - Single-tenant — нет client-side rate-limit; burst protection — задача демона
  - **Особенность**: `get_coinbase_tx_sum(0, tipHeight)` обходит весь chain (~3.6M блоков); сервер enforces ~180s rate-limit на этот метод
  - Methods: `get_info`, `get_last_block_header`, `get_block_header_by_height`, `get_block`, `get_coinbase_tx_sum`
- **citizenweb3 indexer** (`indexer-client.ts`) — для tx-метрик и pool activity (отдельный endpoint, тоже Bearer auth)
- **Pool discovery**: `pool-apis.json` — статический реестр публичных pool API (XMRPool, MineXMR, etc.) для `identify-pool.ts`

URL'ы — в `params.ts` через `nodes` массив. Токен — `MONERO_RPC_TOKEN` env.

## Files

| File | Purpose |
|---|---|
| `constants.ts` | `MONERO_BLOCK_TIME_SECONDS = 120` (target block interval, для расчёта hashrate = difficulty / 120s) |
| `rpc-client.ts` | JSON-RPC client с retry (3 попытки, backoff 250/500/1000ms) и AbortController-таймаутами. `TIMEOUT_MS = 240_000` дефолт; `COINBASE_TX_SUM_TIMEOUT_MS = 240_000` для тяжёлого метода. Retry на network/AbortError/HTTP 5xx; 4xx и JSON-RPC errors — non-retryable |
| `indexer-client.ts` | Клиент к citizenweb3 indexer для tx-метрик (если включается в methods.ts через `nullTxMetrics` — то stubbed) |
| `pool-apis.json` | Реестр публичных Monero mining pool APIs (URL + match-pattern) |
| `identify-pool.ts` | Резолв coinbase tx `extra` / minerTxHash в pool id по `pool-apis.json` |
| `methods.ts` | `ChainMethods`: spread `nullTxMetrics` + 22 null/empty stubs (никаких validators/staking/governance) |

## Indexer jobs (server/jobs/)

| Job | Schedule | What it writes |
|---|---|---|
| `monero-network-info` | every 5 min | `ChainHashrateSnapshot` (height, hashrate, difficulty по минуте) + `Tokenomics.totalSupply` (через `get_coinbase_tx_sum(0, tip)`) |
| `monero-pool-discover` | периодически | Сканирует coinbase outputs против `pool-apis.json` → находит новые pools, регистрирует в DB |
| `monero-pool-identify` | per block / batch | Резолв конкретного блока (coinbase / minerTxHash) → pool id. Дёргается из `identify-pool.ts` |
| `monero-pool-stats` | rolling window | Агрегирует per-pool block count + hashrate share за окно |
| `monero-pool-cluster` | реже | Кластеризует pools в operator-группы по общим payout-адресам (multi-pool операторы) |

Failure policy: outer try/catch — любая ошибка swallowed + logged; следующий тик cron = natural retry. Snapshot пишется ДО supply update — даже если `get_coinbase_tx_sum` упал, hashrate-метрики уже в DB.

## Constraints

- НЕ заполнять `Validator` table — у Monero нет валидаторов (PoW).
- НЕ дёргать публичные `xmr.io` / community RPC без auth — наш self-hosted single-tenant даёт стабильный доступ.
- `get_coinbase_tx_sum(0, N)` — медленный (≥180с на full chain), демон ограничивает rate-limit. НЕ вызывать в hot-path; только из cron job с budgeted timeout.
- `totalSupply` хранится в `Tokenomics` (не `ChainParams`) — schema-specific. `dbChain` ищется по `name: 'monero'`, не по `chainId`.
- `snapshotAt` округляется до минуты — для idempotent upsert по `[chainId, snapshotAt]` unique index.

## Testing

- Прямой curl (см. `MONERO_RPC_TOKEN` в `.env`):
  ```bash
  curl -X POST https://rpc.monero.citizenweb3.com/json_rpc \
    -H "Authorization: Bearer $MONERO_RPC_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","id":"0","method":"get_info"}' \
    --max-time 240
  ```
- Запуск job вручную в indexer-контейнере: см. `validatorinfo-indexer-testing` skill (workflow для monero-network-info).
- DB checks: `chain_hashrate_snapshots WHERE chain_id = (SELECT id FROM chains WHERE name = 'monero')`, `tokenomics WHERE chain_id = ...`.
