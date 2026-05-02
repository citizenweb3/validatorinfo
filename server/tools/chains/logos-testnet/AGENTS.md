# Logos Testnet Module

## Purpose

Минимальная интеграция Logos testnet v0.1.2 (privacy-preserving PoS, Cryptarchia + Blend) в ValidatorInfo. Ecosystem: `logos`. `hasValidators: false`.

## Why this module is small

Logos by design — anonymous block proposers (one-time leader_keys), ZK-hidden stake. Стандартная Cosmos-shape `ChainMethods` неприменима — нет публичной identity валидаторов, нет attributable rewards/votes. Реализован только `getChainUptime`.

## Data source

- **citizenweb3 Logos indexer** (`https://indexer.testnet-logos.citizenweb3.com`, Bearer auth)
  - Endpoint: `GET /api/v1/stats` — отдаёт `node_height`, `node_mode`, `lag_slots`, `total_blocks`, `leaders_count`, `finalized_blocks`, etc.
  - Repo: https://github.com/citizenweb3/chain-data-indexer/tree/logos-indexer-v0.1.2
- **Public RPC** (`https://rpc.logos-testnet.citizenweb3.com`, no auth) — пока не используется в Stage 1, зарезервирован для Stage 2 (если потребуется прямой доступ к ноде).

URL'ы хранятся в `params.ts` через `nodes` массив с типами `'indexer'` и `'rpc'`. Bearer-токен — в `LOGOS_INDEXER_API_TOKEN` env (конвенция `<CHAIN>_INDEXER_API_TOKEN`, см. коммит 7c0d62a).

## Files

| File | Purpose |
|---|---|
| `types.ts` | `LogosStats` — schema `/api/v1/stats` (verified live 2026-05-01) |
| `get-chain-uptime.ts` | Единственный рабочий метод: возвращает `{lastUptimeUpdated, uptimeHeight=node_height, avgTxInterval=2000ms}` |
| `methods.ts` | `ChainMethods` объект: `getChainUptime` + 22 null/empty stubs |

## Stage 2 (not yet implemented)

UI-страница сети `/networks/logos-testnet` со stats и latest blocks (через `/api/v1/blocks?finalized=all`), block detail page (`/api/v1/blocks/:id`), privacy disclosure panel. Подробности в `docs/plans/2026-05-01-logos-testnet-integration-design.md` § Этап 2.

## Constraints

- НЕ менять `Prisma` schema под Logos (privacy by design — нет attributable validators).
- НЕ заполнять `Validator` table — leader_keys одноразовые (verified: 77262 blocks = 77262 unique leaders на 2026-05-01).
- НЕ дёргать `devnet.blockchain.logos.co` — за HTTP Basic auth, недоступно публично.
- Cryptarchia slot duration = 2000ms (константа в `get-chain-uptime.ts`); refine когда подтвердится официальная цифра в Logos docs.

## Versioning

`chainId: 'logos-testnet-v0.1.2'`. На breaking-restart Logos testnet'а — создать новый chain entry, старый пометить `tags: ['Deprecated']` (см. design doc § Open question 5).
