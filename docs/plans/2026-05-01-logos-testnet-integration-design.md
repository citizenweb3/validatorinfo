---
date: 2026-05-01
revised: 2026-05-01
type: design
slug: logos-testnet-integration
related_projects: [validatorinfo]
tags: [chain-integration, privacy-chain, logos, cryptarchia, testnet]
status: revised
source_task: "Спроектируй интеграцию сети Logos testnet (v0.1.2) в ValidatorInfo. Двухэтапная задача."
---

# Logos testnet v0.1.2 — Integration Design (revision 2)

## TL;DR

Logos — приватная PoS-сеть (Cryptarchia + Blend) с **анонимными блок-пропоузерами** через one-time leader-keys и ZK-скрытым стейком. Cosmos-парадигма ValidatorInfo неприменима. Минимально-достаточная интеграция этапа 1: зарегистрировать Logos как chain (`hasValidators: false`, новый ecosystem `logos`), реализовать **только `getChainUptime`** через готовый indexer-сервис от citizenweb3 (`indexer.testnet-logos.citizenweb3.com`, Bearer auth), все остальные методы — безопасные пустые stubs. Schema не трогаем, новых jobs нет, новых утилит нет — используем встроенный `ChainNodeType: 'indexer'` и inline-fetch паттерн (как `solana/get-nodes.ts:44-49` с `Token` env-header).

## Проблема и контекст

### Что такое Logos и почему он не вписывается

- **Cryptarchia PoS**, унаследованная от Ouroboros Crypsinous + privacy extensions. Лидер выбирается через VRF, identity ZK-скрыта, one-time leader-keys предотвращают связывание блоков с одним пропоузером ([Anonymous Block Proposers](https://press.logos.co/article/anonymous-block-proposers)).
- **Blend network** маскирует сетевую позицию пропоузера через mix-релеи.
- **Стейк скрыт ZK** (note value не виден, экономическая финальность ~18 часов).
- v0.1.2 — breaking релиз 2026-04-14, новый genesis ([Testnet v0.1 in Review](https://press.logos.co/article/testnet-v0-1-review)).

### Реальные источники данных (revision 2 — live проверка)

В исходной ревизии дизайн строился вокруг гипотетического вызова к нодам напрямую (`devnet.blockchain.logos.co/node/N`). Live-проверка показала, что эти URL'ы за HTTP Basic auth (`WWW-Authenticate: Basic realm="Restricted API"`) и для нас недоступны. Реально доступны два других источника:

**1. Публичный RPC `rpc.logos-testnet.citizenweb3.com` (без auth)** — три рабочих эндпоинта:

| Endpoint | Response |
|---|---|
| `GET /cryptarchia/info` | `{lib, lib_slot, tip, slot, height, mode: "Online" \| "Bootstrapping"}` |
| `GET /network/info` | `{listen_addresses[], peer_id, n_peers, n_connections, n_pending_connections}` |
| `GET /cryptarchia/headers` | `string[]` (массив hex hash'ей последних блоков в fork-choice окне) |

Корневой `/` всегда 404 — **это нормально**, root-эндпоинта нет. Все пути начинаются с `/cryptarchia/`, `/network/`, `/wallet/`, `/storage/`.

**2. Citizenweb3 indexer `indexer.testnet-logos.citizenweb3.com` (Bearer auth)** — наш собственный сервис ([github.com/citizenweb3/chain-data-indexer](https://github.com/citizenweb3/chain-data-indexer/tree/logos-indexer-v0.1.2)). Tokens TS/Node, Postgres-storage, REST API на порту 3001:

| Endpoint | Response shape |
|---|---|
| `GET /health` | `{status, last_slot, node_tip_slot, node_height, node_mode, lag_slots, uptime_s}` |
| `GET /api/v1/stats` | `{total_blocks, finalized_blocks, latest_slot, latest_height, leaders_count, last_indexed_slot, node_tip_slot, node_height, node_mode, lag_slots}` |
| `GET /api/v1/blocks?limit&offset&finalized&leader_key` | `{data: BlockRow[], pagination}` |
| `GET /api/v1/blocks/:id` | `BlockRow \| {error: "not_found"}` |
| `GET /api/v1/validators?limit&offset` | `{data: LeaderRow[], pagination}` |
| `GET /api/v1/validators/:leader_key` | `LeaderRow \| {error: "not_found"}` |

`BlockRow`: `{id, parent_block, slot, height, block_root, leader_key, voucher_cm, entropy, tx_count, raw, finalized, indexed_at}`.
`LeaderRow`: `{leader_key, blocks_produced, first_block_slot, last_block_slot, updated_at}`.

**Критическое наблюдение про leaders.** На моменте проверки `/api/v1/stats` вернул `total_blocks: 77262`, `leaders_count: 77262`, и каждый `leader_key` в `/api/v1/validators` имеет `blocks_produced: 1`. Это **by design Cryptarchia** — anonymous one-time leader keys. Поэтому стандартный validator-leaderboard ("Top N validators by blocks") бессмыслен — у всех ровно один блок. `leaders_count` имеет смысл как **privacy-метрика** ("на N блоков — N разных лидеров"), не как список валидаторов.

### Что у ValidatorInfo не сходится с Logos

Интерфейс `ChainMethods` (см. `server/tools/chains/chain-indexer.ts:164-188`) — 23 метода, ориентированные на Cosmos-shape: каждый предполагает, что валидатор имеет публичную identity, on-chain стейк, attributable rewards/votes/slashing-историю. Все эти предположения **противоречат дизайну Logos**.

### Constraints

- **Технические**: schema-changes дороги (мульти-чейн миграции, риск дрейфа на dev/main); v0.1.2 нестабилен и переживёт ещё breaking-релизы; LEZ explorer пока не существует.
- **Временные**: ночная задача, целевой объём — proof-of-presence + одна живая метрика, не полнофункциональный explorer.
- **Архитектурные**: ValidatorInfo сейчас обслуживает 21 chain; рефакторинг центрального `ChainMethods` интерфейса ради одного приватного chain'а — over-engineering.

### Success criteria

1. Logos зарегистрирован как chain (`logos-testnet`), отображается в списке сетей.
2. Indexer не падает на Logos: 7 jobs скипают через `hasValidators: false`, остальные ~16 jobs получают валидные пустые shapes.
3. `getChainUptime` возвращает живые данные с citizenweb3 indexer'а (`node_height`, `lastUptimeUpdated`); крон-job `chain-uptime` обновляет `Chain.uptimeHeight` без ошибок.
4. Никаких изменений в Prisma schema. Никаких новых jobs. Никаких новых общих утилит.
5. Будущая инкрементальная эволюция (LEZ explorer, новые приватные сети, расширение методов) не заблокирована.

## Голоса агентов (revision 2 update)

В revision 1 голоса архитектора, code-reviewer'а и general-purpose сошлись на: (1) Logos — не валидаторный chain в смысле ValidatorInfo'ской модели, не подделывать validator-shape; (2) `Validator` model не трогать; (3) Aztec-паттерн (events DB, history jobs) для Logos излишен; (4) Logos — собственный ecosystem-блок. Эти точки согласия **остаются в силе**.

Revision 2 уточняет тактику: Logos индексирует своя команда citizenweb3 через отдельный сервис. Поэтому `getChainUptime` теперь имеет смысл — есть стабильный источник `node_height`/`last_indexed_slot`, который мы можем дергать на хук `chain-uptime` крона. `getNodes` отказываемся реализовывать (peer-snapshot был бы фактически неверным мэппингом, см. revision 1; leader_keys одноразовы и не репрезентативны).

## Точки расхождения и их разрешение (revision 2)

### Расхождение 1: рефакторить `ChainMethods` сейчас? — **отвергаем (без изменений с rev.1)**

Цена рефакторинга 21 chain'а несопоставима с выгодой одной testnet-интеграции. Используем существующий `hasValidators: false` (де-факто capability flag). Когда добавится 2-й приватный chain — экстрактим в полноценный `capabilities`.

### Расхождение 2: новая Prisma-модель `NetworkNode`? — **отвергаем (без изменений)**

YAGNI на v0.1.2. Когда LEZ explorer стабилизирует публичный API — оценим тогда.

### Расхождение 3: новый ecosystem `logos`? — **принимаем (без изменений)**

Малоинвазивно, чистый якорь для UI-условий и будущих приватных chain'ов.

### Расхождение 4: реализовать `getNodes`? — **отвергаем (изменено в rev.2)**

Revision 1 предлагала реализовать `getNodes` через peer_id. Revision 2: live-проверка показала, что peer_id — это идентификатор P2P-узла RPC, не proposer'а; leader_key из citizenweb3 indexer'а — одноразовый и не репрезентативный. Маппить ни тот, ни другой в `NodeResult` фактически некорректно. **`getNodes: async () => []`** — stub.

### Расхождение 5 (новое в rev.2): реализовать ли `getChainUptime`? — **принимаем**

У нас есть `indexer.testnet-logos.citizenweb3.com/api/v1/stats` с `node_height` и `node_mode`. Это маппится в `ChainUptime { lastUptimeUpdated, uptimeHeight, avgTxInterval }` без насилия над контрактом. `avgTxInterval` константа `2000` (Cryptarchia slot ≈ 2 сек, refine после получения официальной цифры из docs).

### Расхождение 6 (новое в rev.2): нужна ли утилита `fetch-logos-*.ts`? — **отвергаем**

Аудит 16 chain-модулей показал: inline `fetch()` — доминирующий паттерн (solana, namada, celestia, aztec). Эталон с auth: `solana/get-nodes.ts:44-49` (`Token: process.env.VALIDATORS_APP_TOKEN`). Вынос в общую утилиту оправдан только когда ≥2 вызова к одному API из одного чейна (как `aztec/utils/fetch-provider-metadata.ts`). На этапе 1 у нас один вызов — `getChainUptime` к `/api/v1/stats`. **Inline.** Если этап 2 принесёт ≥2 вызова к citizenweb3 indexer'у — тогда экстрактим `utils/fetch-logos-indexer.ts`.

## Финальный дизайн

### Архитектура (один взгляд)

```
┌─────────────────────────────────────────────────────────────┐
│                  LOGOS-TESTNET MODULE                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  server/tools/chains/logos-testnet/                          │
│  ├── methods.ts          ChainMethods aggregator             │
│  │                       (getChainUptime real, остальные —   │
│  │                        безопасные stubs)                  │
│  ├── get-chain-uptime.ts inline fetch к citizenweb3 indexer  │
│  │                       (Bearer из LOGOS_INDEXER_API_TOKEN)     │
│  └── types.ts            LogosStats, LogosHealth shapes      │
│                                                              │
│  Edits:                                                      │
│  - server/tools/chains/params.ts                             │
│      + ecosystemParams entry: 'logos'                        │
│      + chainParams entry: 'logos-testnet'                    │
│        (hasValidators: false; nodes [rpc + indexer])         │
│  - server/tools/chains/methods.ts                            │
│      + import + record entry                                 │
│  - server/tools/chains/chains.ts        — без правок         │
│  - prisma/schema.prisma                  — без правок         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                  Existing indexer cron pipeline
                  (hasValidators: false скипает 7 jobs;
                   chain-uptime job вызывает getChainUptime)
```

### Компоненты

#### 1. `server/tools/chains/logos-testnet/types.ts`

Chain-specific TypeScript типы (паттерн `aztec/types.ts`):

```ts
// Citizenweb3 indexer responses
export interface LogosHealth {
  status: 'ok' | string;
  last_slot: number;
  node_tip_slot: number;
  node_height: number;
  node_mode: 'Online' | 'Bootstrapping';
  lag_slots: number;
  uptime_s: number;
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
  node_mode: 'Online' | 'Bootstrapping';
  lag_slots: number;
}

// (Зарезервировано на этап 2 — server-actions для UI могут импортировать
//  и расширять эти типы по мере необходимости.)
export interface LogosBlockRow {
  id: string;
  parent_block: string | null;
  slot: number;
  height: number;
  block_root: string;
  leader_key: string;
  voucher_cm: string | null;
  entropy: string | null;
  tx_count: number;
  raw: unknown;
  finalized: boolean;
  indexed_at: string;
}

export interface LogosLeaderRow {
  leader_key: string;
  blocks_produced: number;
  first_block_slot: number;
  last_block_slot: number;
  updated_at: string;
}

// Public RPC (rpc.logos-testnet.citizenweb3.com)
export interface LogosCryptarchiaInfo {
  lib: string;
  lib_slot: number;
  tip: string;
  slot: number;
  height: number;
  mode: 'Online' | 'Bootstrapping';
}

export interface LogosNetworkInfo {
  listen_addresses: string[];
  peer_id: string;
  n_peers: number;
  n_connections: number;
  n_pending_connections: number;
}
```

#### 2. `server/tools/chains/logos-testnet/get-chain-uptime.ts`

Inline-fetch к citizenweb3 indexer'у с Bearer (паттерн `solana/get-nodes.ts:44-49`). Берём URL индексера из `getChainParams(dbChain.name).nodes` (паттерн `aztec/get-chain-uptime.ts:17-23`). Контракт `GetChainUptime` — `(dbChain: Chain) => Promise<ChainUptime | null>` (см. `chain-indexer.ts:161`).

```ts
import { Chain } from '@prisma/client';

import logger from '@/logger';
import { GetChainUptime } from '@/server/tools/chains/chain-indexer';
import { LogosStats } from '@/server/tools/chains/logos-testnet/types';
import { getChainParams } from '@/server/tools/chains/params';

const { logError, logWarn } = logger('logos-chain-uptime');

// Cryptarchia slot duration (~2s). Refine when official docs publish exact value.
const CRYPTARCHIA_SLOT_DURATION_MS = 2000;
const REQUEST_TIMEOUT_MS = 8000;

const getChainUptime: GetChainUptime = async (dbChain: Chain) => {
  const params = getChainParams(dbChain.name);
  const indexerUrl = params.nodes.find((n) => n.type === 'indexer')?.url;
  const token = process.env.LOGOS_INDEXER_API_TOKEN;

  if (!indexerUrl) {
    logError(`No indexer node configured for ${dbChain.name}`);
    return null;
  }
  if (!token) {
    logWarn(`LOGOS_INDEXER_API_TOKEN not set — skipping uptime fetch`);
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${indexerUrl}/api/v1/stats`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    });
    if (!res.ok) {
      logError(`indexer returned ${res.status} ${res.statusText}`);
      return null;
    }
    const stats = (await res.json()) as LogosStats;
    if (typeof stats.node_height !== 'number') {
      logError(`indexer /stats missing node_height: ${JSON.stringify(stats)}`);
      return null;
    }
    return {
      lastUptimeUpdated: new Date(),
      uptimeHeight: stats.node_height,
      avgTxInterval: CRYPTARCHIA_SLOT_DURATION_MS,
    };
  } catch (e) {
    logError(`failed to fetch indexer stats`, e);
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

export default getChainUptime;
```

#### 3. `server/tools/chains/logos-testnet/methods.ts`

```ts
import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import getChainUptime from '@/server/tools/chains/logos-testnet/get-chain-uptime';

const logosChainMethods: ChainMethods = {
  // Real implementation
  getChainUptime,

  // Privacy-chain stubs (see "Принцип stub'ов" below)
  getNodes: async () => [],
  getApr: async () => null,
  getTvs: async () => null,
  getStakingParams: async () => ({ unbondingTime: null, maxValidators: null }),
  getNodeParams: async () => ({
    peers: null,
    seeds: null,
    daemonName: null,
    nodeHome: null,
    keyAlgos: null,
    binaries: null,
    genesis: null,
  }),
  getProposals: async () => ({ proposals: [], total: 0, live: 0, passed: 0 }),
  getSlashingParams: async () => ({ blocksWindow: null, jailedDuration: null }),
  getMissedBlocks: async () => [],
  getNodesVotes: async () => [],
  getCommTax: async () => null,
  getWalletsAmount: async () => null,
  getProposalParams: async () => ({
    creationCost: null,
    votingPeriod: null,
    participationRate: null,
    quorumThreshold: null,
  }),
  getNodeRewards: async () => [],
  getNodeCommissions: async () => [],
  getCommunityPool: async () => null,
  getActiveSetMinAmount: async () => null,
  getInflationRate: async () => null,
  getCirculatingTokensOnchain: async () => null,
  getCirculatingTokensPublic: async () => null,
  getDelegatorsAmount: async () => [],
  getUnbondingTokens: async () => null,
  getRewardAddress: async () => [],
};

export default logosChainMethods;
```

**Принцип stub'ов** (выработан из аудита `server/jobs/update-chain-*.ts`):

`hasValidators: false` покрывает только 7 jobs из ~25, которые проверяют флаг (`get-nodes.ts:27`, `update-chain-staking-params.ts:21`, `update-chain-slashing-params.ts:21`, `update-proposal-params.ts:23`, `update-slashing-infos.ts`, `update-unbonding-tokens.ts`, `update-nodes-votes.ts`). Остальные jobs **всегда** вызывают свой `chainMethods.*`, поэтому stub'ы должны возвращать корректный shape:

- **null-skip-aware jobs**: `getApr`, `getTvs`, `getCommTax`, `getCommunityPool`, `getActiveSetMinAmount`, `getInflationRate`, `getCirculatingTokensOnchain`, `getCirculatingTokensPublic`, `getUnbondingTokens`, `getWalletsAmount` — возвращают `null` (jobs делают `if (x === null) continue`).
- **shape-with-empty-arrays**: `getProposals` → `{proposals: [], total: 0, live: 0, passed: 0}`; `getNodeRewards`/`getNodeCommissions`/`getNodesVotes`/`getMissedBlocks`/`getDelegatorsAmount`/`getRewardAddress`/`getNodes` → `[]` — jobs делают `.map`/`for`/`.length` итерации.
- **shape-with-null-fields**: `getProposalParams`, `getStakingParams`, `getSlashingParams`, `getNodeParams` — объект со всеми обязательными ключами и `null` значениями.
- **`getChainUptime`**: реализован полноценно (см. §2). Возвращает `null` при ошибке/отсутствии токена — `update-chain-uptime` job это корректно скипает.

#### 4. `server/tools/chains/params.ts` правки

**Новый ecosystem** (добавить в массив `ecosystemParams`):

```ts
{
  name: 'logos',
  prettyName: 'Logos',
  logoUrl: '...',  // см. ниже про логотип
  tags: ['Privacy', 'PoS', 'Cryptarchia', 'Anonymous Proposers', 'ZK'],
},
```

**Новый chain config** (добавить в `chainParams` объект). Используем встроенный `ChainNodeType: 'indexer'` (см. `chain-indexer.ts:9` — он уже включает `'indexer'`, паттерн используется в Namada). Все обязательные поля `AddChainProps` (см. `chain-indexer.ts:47-74`) на месте:

```ts
'logos-testnet': {
  rang: 3,
  ecosystem: 'logos',
  hasValidators: false,
  name: 'logos-testnet',
  prettyName: 'Logos Testnet',
  shortDescription: 'Privacy-preserving Cryptarchia PoS testnet with anonymous block proposers',
  chainId: 'logos-testnet-v0.1.2',
  bech32Prefix: '',
  coinDecimals: 0,
  coinGeckoId: '',
  coinType: 0,
  denom: 'LOGOS',
  minimalDenom: 'logos',
  logoUrl: '...',  // citizenweb3/staking CDN или GitHub-org placeholder
  nodes: [
    { type: 'rpc',     url: 'https://rpc.logos-testnet.citizenweb3.com',         provider: 'citizenweb3' },
    { type: 'indexer', url: 'https://indexer.testnet-logos.citizenweb3.com',     provider: 'citizenweb3' },
  ],
  mainRepo: 'https://github.com/logos-blockchain/logos-blockchain',
  docs: 'https://github.com/logos-co/logos-docs',
  githubUrl: 'https://github.com/logos-blockchain',
  twitterUrl: 'https://x.com/Logos_state',
  tags: ['Logos Ecosystem', 'Testnet', 'Privacy', 'Cryptarchia', 'Anonymous Proposers'],
},
```

**Логотип**: SVG из `logos.co` или `logos-blockchain/logos-blockchain/assets/`. Если в `citizenweb3/staking` (CDN для других chain-логотипов) ещё нет logos.svg — пушнуть отдельным PR; пока — placeholder из логотипов GitHub-org.

#### 5. `server/tools/chains/methods.ts` правки

```ts
import logosChainMethods from '@/server/tools/chains/logos-testnet/methods';
// ...
const chainMethods: Record<string, ChainMethods> = {
  // ...existing entries...
  'logos-testnet': logosChainMethods,
};
```

#### 6. `server/tools/chains/chains.ts` — без правок

`excludeChains` (строки 3-8) сейчас содержит `['nillion', 'space-pussy', 'symphony-testnet', 'warden-testnet']`. Logos туда не входит, автоматически попадает через `chainParamsArray.filter(...)`. Если репо в "Aztec-only mode" (memory `project_indexer_aztec_only_mode.md`) — это dev-режим, для smoke-теста временно меняется на `['logos-testnet']` (см. План имплементации §7).

#### 7. Инициализация в БД

`server/tools/init-chains.ts:33` пишет `hasValidators: chain.hasValidators` при upsert/create — подтверждено аудитом, fix не нужен. Ecosystem upsert через `init-chains.ts:138-169` — добавление одной записи в `ecosystemParams` достаточно.

### Env-переменные

Добавить в `.env.example`:

```
# Logos testnet — citizenweb3 indexer Bearer token
LOGOS_INDEXER_API_TOKEN=
```

URL'ы — в `params.ts` (как для всех chain'ов; ETHEREUM_RPC_KEY-pattern только для секретов в URL'е). Без токена `getChainUptime` молча возвращает `null` (job скипает) — dev-окружение без `.env` правок работает.

### Data flow

```
1. Indexer boot
   └─▶ init-chains.ts  →  upsert Chain(name='logos-testnet', hasValidators=false)
                          + Ecosystem(name='logos') upsert + ChainNode rows
                            (rpc + indexer URLs)

2. Cron tick 'chain-uptime' (everyHour)
   └─▶ getChainUptime(dbChain)
        ├─▶ getChainParams('logos-testnet').nodes.find(n => n.type === 'indexer')
        ├─▶ fetch('https://indexer.../api/v1/stats',
        │         { headers: { Authorization: 'Bearer <LOGOS_INDEXER_API_TOKEN>' } })
        ├─▶ parse → { node_height, node_mode, ... }
        └─▶ return { lastUptimeUpdated, uptimeHeight: node_height, avgTxInterval: 2000 }
              update Chain.uptimeHeight, lastUptimeUpdated, avgTxInterval

3. Cron tick 'chain-aprs' (everyHour)
   └─▶ updateChainApr(['logos-testnet'])
        ├─▶ chainMethods.getApr()  →  null
        └─▶ skip (null check, no DB write)

4. Cron tick 'staking-params' (everyDay)
   └─▶ dbChain.hasValidators === false  →  skip whole chain block
                                            (getStakingParams NOT called)

5. Cron tick 'get-nodes'
   └─▶ dbChain.hasValidators === false  →  skip whole chain block
                                            (getNodes NOT called)

6. Cron tick 'proposals'
   └─▶ chainMethods.getProposals()  →  {proposals: [], total: 0, live: 0, passed: 0}
        └─▶ Loop over [] no-ops; Chain.proposalsLive=0 etc.
```

Result: indexer не падает, не пишет мусорных данных, Logos виден в UI как chain без валидаторов/governance, **с живой `uptimeHeight`** обновляющейся каждый час.

### Error handling

- `getChainUptime`: возвращает `null` при отсутствии URL'а индексера, отсутствии токена, не-2xx ответе, таймауте, network error, JSON parse error, missing `node_height`. Никаких throw'ов — контракт `GetChainUptime` это `Promise<ChainUptime | null>`.
- Все stub-методы — synchronous `async () => ...`, не могут бросать.
- Logger использует `logError`/`logWarn` — `logError` для конфигурационных ошибок (нет URL'а — это баг конфига), `logWarn` для отсутствующего токена (валидное dev-состояние).

### Что НЕ делается на этом этапе (etap 1)

- ❌ Frontend изменения (отдельная "Network" tab, privacy disclosure panel, latest blocks list, leaders cardinality metric) — этап 2.
- ❌ Prisma schema migrations.
- ❌ Новые indexer jobs (`update-logos-network-history`, peer geographic distribution и т.п.).
- ❌ Рефакторинг `ChainMethods` интерфейса.
- ❌ Новая Prisma `NetworkNode` модель.
- ❌ Новые общие утилиты (`fetch-logos-*.ts`, `api.ts` и пр.).
- ❌ `getNodes` имплементация (peer_id и leader_key одинаково неподходят).
- ❌ Tokenomics tracking (нет circulating supply API на v0.1.2).
- ❌ Block explorer / tx history (LEZ explorer пока не существует).
- ❌ Логотип в citizenweb3/staking CDN — отдельный PR.

## План имплементации

### Этап 1 — Backend chain registration (этот дизайн)

1. **Создать `server/tools/chains/logos-testnet/types.ts`** — TS-типы (`LogosHealth`, `LogosStats`, `LogosBlockRow`, `LogosLeaderRow`, `LogosCryptarchiaInfo`, `LogosNetworkInfo`).
2. **Создать `server/tools/chains/logos-testnet/get-chain-uptime.ts`** — реализация `GetChainUptime` через citizenweb3 indexer.
3. **Создать `server/tools/chains/logos-testnet/methods.ts`** — `ChainMethods` объект (real `getChainUptime` + 22 stub'а).
4. **Отредактировать `server/tools/chains/params.ts`** — добавить `ecosystemParams.logos` и `chainParams['logos-testnet']` с двумя nodes (rpc + indexer).
5. **Отредактировать `server/tools/chains/methods.ts`** — импорт + запись в record.
6. **Добавить `LOGOS_INDEXER_API_TOKEN=` в `.env.example`** (без значения).
7. **Локальный smoke-test**:
   - В `server/tools/chains/chains.ts` временно заменить `excludeChains`/`includeChains` на `includeChains: ['logos-testnet']` (или восстановить из aztec-only mode на logos-only, см. memory).
   - Установить `LOGOS_INDEXER_API_TOKEN` в локальном `.env`.
   - `docker compose -f docker-compose.dev.yml up -d --build` или `yarn dev` + indexer.
   - Проверить: (а) `Chain` и `Ecosystem` записи созданы; (б) `chain-uptime` крон обновил `Chain.uptimeHeight` (ожидается ~80000+); (в) `getProposals`/`getApr`/etc. не падают (логи без exceptions); (г) `/networks/logos-testnet` страница рендерится без 500.
8. **`yarn lint && yarn build`** — типы зелёные.
9. **Создать `server/tools/chains/logos-testnet/AGENTS.md`** — короткое описание модуля по примеру `aztec/AGENTS.md` (поверхность меньше: ecosystem, hasValidators=false, источник данных = citizenweb3 indexer, env, контакт-точки для этапа 2).

### Этап 2 — UI/UX (отдельная задача, вне этого дизайна)

**Верифицированные live-схемы (2026-05-01)** — на этих shape'ах строится UI:

`GET /api/v1/stats` (Bearer):
```json
{
  "total_blocks": 77262, "finalized_blocks": 0,
  "latest_slot": 1452758, "latest_height": null,
  "leaders_count": 77262,
  "last_indexed_slot": 1515609, "node_tip_slot": 1515638,
  "node_height": 80430, "node_mode": "Online", "lag_slots": 29
}
```
- `latest_height: null` на v0.1.2 (height-tracking не активен).
- `leaders_count == total_blocks` всегда — by design Cryptarchia (one-time leader_keys). Для UI показываем как одну privacy-метрику, не дублируем.
- `total_transactions` / `total_mantles` / `last_block_time` **отсутствуют** в текущей схеме `/stats`. Транзакции отложены до v0.2 (см. `docs/future.md` индексера). Когда citizenweb3 добавит SUM(tx_count) в `/stats` — наш код просто прочитает новое поле (forward-compatible).

`GET /api/v1/blocks?limit&offset&finalized&leader_key` (Bearer):
- Дефолт `finalized=true`. Т.к. `finalized_blocks=0` на v0.1.2, **нужен `finalized=all`** иначе пустой массив.
- Каждый элемент = `BlockRow` (см. §1).

`GET /api/v1/blocks/:id` (Bearer) — **полностью работает сейчас**, отдаёт `BlockRow` + поле `raw` со всем header'ом блока (включая `proof_of_leadership.proof[]`):
```json
{
  "id": "...", "parent_block": "...", "slot": 999991, "height": null,
  "block_root": "...", "leader_key": "...", "voucher_cm": "...", "entropy": "...",
  "tx_count": 0, "finalized": false, "indexed_at": "...",
  "raw": { "header": { "id": "...", "slot": 999991, "proof_of_leadership": {...}, ... } }
}
```

**UI компоненты:**

1. На странице `/networks/logos-testnet` — переименовать вкладку "Validators" → "Network" (или скрыть, если флаг `hasValidators=false` уже это делает в текущем UI).
2. **Privacy disclosure panel**: editorial-секция "What's hidden on Logos and why" (anonymous proposers, ZK stake, Blend mix-network).
3. **Network health card** (server-action к `/api/v1/stats`):
   - `node_mode` (Online / Syncing badge)
   - `node_height` + `lag_slots` (отставание индексера от tip)
   - `node_tip_slot` (текущий slot сети)
   - `total_blocks` (= `leaders_count`, показываем одной метрикой "N blocks / N unique leaders" — privacy-индикатор)
   - `finalized_blocks` (с пометкой "finality not yet active on v0.1.2")
4. **Latest blocks list**: `/api/v1/blocks?limit=20&finalized=all` — колонки: slot, leader_key (truncated), `tx_count` (=0 сейчас, заработает с v0.2 без изменений нашего кода), `finalized`, `indexed_at`. Поле `height` пока всегда `null` — не показываем колонку либо ставим placeholder.
5. **Block detail page** `/networks/logos-testnet/blocks/[id]` — новая страница:
   - Identifiers: `id`, `parent_block`, `block_root` (linkable)
   - `slot` (height скрыт пока null)
   - `leader_key` — труcated с tooltip "one-time anonymous proposer key (Cryptarchia)"
   - `voucher_cm` — labelled "Privacy stake commitment"
   - `entropy` — labelled "VRF entropy"
   - `tx_count`, `finalized`, `indexed_at`
   - `<details>`-блок с raw JSON (включая `proof_of_leadership.proof[]` массив байтов)
6. **Локализация**: en.json/pt.json/ru.json — новые ключи `Networks.Logos.privacyDisclosure`, `Networks.Logos.networkStats`, `Networks.Logos.blockDetails`.
7. **Решение про общий fetch-helper**: Этап 2 сделает ≥3 server-actions к citizenweb3 indexer'у (stats, blocks list, block detail) — **экстрактим** `server/tools/chains/logos-testnet/utils/fetch-logos-indexer.ts` (паттерн `aztec/utils/fetch-provider-metadata.ts`). Базовый URL берём из `getChainParams('logos-testnet').nodes` (type='indexer'), токен из `LOGOS_INDEXER_API_TOKEN`.

### Этап 3 — когда LEZ explorer от команды Logos релизнется

- Оценить добавление block/tx history через LEZ API.
- Возможно — `update-logos-network-history` job (timeseries для slot/height/peer count) с использованием существующей `ChainTvsHistory`/`ChainAprHistory` инфраструктуры или новой `ChainNetworkHistory`.
- Опциональный faucet-link.

### Этап 4 — добавление 2-го приватного chain'а (когда понадобится)

- К тому моменту экстрактить `capabilities: Set<'validators' | 'governance' | 'staking' | 'network'>` из `hasValidators` (закрывает architect'овский долгосрочный аргумент из rev.1).
- Возможно — общий `server/tools/chains/_privacy/` shared module.

## Review iterations

### Итерация 1 (`feature-dev:code-reviewer`, 2026-05-01) — закрыта

- ✅ Все 23 ключа `ChainMethods` присутствуют в stub-объекте.
- ✅ `init-chains.ts:33` пишет `hasValidators: chain.hasValidators`.
- ✅ `ecosystemParams` upsert через `init-chains.ts:138-169` достаточно.
- ✅ `hasValidators: false` skip — проверено: 7 jobs скипают, остальные 16 jobs корректно null-checkают/итерируют по empty arrays.
- ✅ `chainId` opaque string — `'logos-testnet-v0.1.2'` корректен.
- ✅ Типы `NodeResult`, `BondStatus`, `ValidatorCommission` — больше не релевантны после rev.2 (отказ от `getNodes`).

### Итерация 2 (live API + project-pattern audit, 2026-05-01) — закрыта

- ❌ → ✅ **Auth-схема**. Rev.1 предполагала Bearer к `devnet.blockchain.logos.co/node/N`. Live curl показал: эти URL'ы за HTTP Basic auth (`WWW-Authenticate: Basic`), а не Bearer. **Фикс**: исключаем эти URL'ы из дизайна. Реальные источники — публичный RPC `rpc.logos-testnet.citizenweb3.com` (без auth) и citizenweb3 indexer `indexer.testnet-logos.citizenweb3.com` (Bearer). Bearer-схема **остаётся** для индексера, но URL и контекст другие.
- ❌ → ✅ **Источник данных**. Rev.1 строила `getNodes` поверх `/cryptarchia/info`+`/network/info`. Rev.2: эти эндпоинты дают только snapshot одного RPC-узла (нашего шлюза), это не peer-list сети. Реальный peer-shape недоступен публично. Отказ от `getNodes`, переход на `getChainUptime` поверх citizenweb3 `/api/v1/stats`.
- ❌ → ✅ **Структура файлов**. Rev.1 предлагала `api.ts` + `get-nodes.ts`. Аудит 21 chain-модуля показал, что `api.ts` не существует ни в одном — доминирующий паттерн inline `fetch()` (solana, namada, celestia, aztec). Эталон с auth: `solana/get-nodes.ts:44-49` (`Token: process.env.VALIDATORS_APP_TOKEN`). **Фикс**: убираем `api.ts`, inline fetch в `get-chain-uptime.ts`.
- ❌ → ✅ **Тип ChainNodeType: 'indexer'**. Rev.1 хранила URL индексера в env. Аудит показал — `ChainNodeType` (chain-indexer.ts:9) уже включает `'indexer'`, и Namada это использует. **Фикс**: оба URL'а в `nodes` массив `params.ts`, env только для секретного токена.
- ⚠️ **Минорная хрупкость**: `update-nodes-commissions.ts:29` гейтит вызов через `if (ecosystem === 'cosmos')`. Для `ecosystem='logos'` это эффективно скипнет вызов — то есть stub `getNodeCommissions: async () => []` никогда не позовётся на текущей кодовой базе. Рабочее, но если кто-то снимет ecosystem-гейт — наш stub уже корректен. Оставляем.
- ✅ Live RPC `cryptarchia/info` shape подтверждён + добавлено упущенное в rev.1 поле `lib_slot`.
- ✅ Citizenweb3 indexer `/health` и `/api/v1/stats` shapes подтверждены (см. `LogosHealth`/`LogosStats` в §1).
- ✅ Get `dbChain.nodes` через `getChainParams(dbChain.name).nodes` (паттерн `aztec/get-chain-uptime.ts:17`) — `dbChain.nodes` через Prisma это `Node[]` валидаторов, не RPC URL'ы.

Issues с >90% confidence по итерации 2: **0 оставшихся**. Дизайн готов к имплементации.

### Итерация 3 (refinement схем + Stage 2 scope, 2026-05-01) — закрыта

- ✅ **Точная схема `/api/v1/stats`** перепроверена live: 10 полей (без `total_transactions`/`total_mantles`/`last_block_time` — это не предусмотрено индексером в v0.1.2). Stage 2 health card перестроен под реальный набор: `node_mode`, `node_height`, `lag_slots`, `node_tip_slot`, `total_blocks` (= `leaders_count`), `finalized_blocks`.
- ✅ **`tx_count` per block** — поле есть в схеме, всегда `0` на v0.1.2. Транзакции deferred to v0.2 в самом Logos (`docs/future.md` индексера). Колонку показываем сразу — заработает без изменений нашего кода.
- ✅ **`/api/v1/blocks/:id`** — verified live: возвращает `BlockRow + raw` (полный header блока с `proof_of_leadership`). Block detail page добавлена в Stage 2 scope.
- ✅ **`finalized=all` обязателен** для list endpoint'а — `finalized_blocks=0` на v0.1.2, без флага UI получит пустой массив.
- ✅ **`latest_height: null`** — height-tracking не активен в v0.1.2, колонку height не показываем (или placeholder).
- ✅ **Fetch-helper решение**: Этап 2 = ≥3 server-actions → экстрактим `utils/fetch-logos-indexer.ts` (закрыт open question 6).
- ✅ **`leaders_count == total_blocks`** перепроверено: 77262/77262, эмпирически + by-design Cryptarchia. Не дублируем в UI.

## Open questions

1. **Логотип**: куда пушим SVG? Оставить placeholder или сразу залить в `citizenweb3/staking`?
2. **Cryptarchia slot duration**: константа `2000ms` основана на наблюдаемом slot rate (текущий `slot=1511451`, `height=80226` за известное время testnet'а). Подтвердить точную цифру в Logos docs или вычислить из последовательных `/cryptarchia/info` снимков.
3. **Closed (rev.2)**: Auth для devnet — закрыт, citizenweb3 indexer Bearer-токен у нас есть.
4. **Ecosystem-tag для UI**: фронт уже фильтрует по `ecosystem` — новый `'logos'` потребует добавления в фильтры на `/ecosystems`/`/networks`. Это в этапе 2.
5. **Locked dependency upgrade**: chainId `'logos-testnet-v0.1.2'` версионирован — при следующем breaking-restart создаём новый chain, старый помечаем `tags: ['Deprecated']`.
6. **Closed (rev.3, итерация 3)**: Etap 2 fetch-helper — экстрактим (≥3 вызова).

## Sources

- [Logos Testnet v0.1 in Review — Logos Press Engine](https://press.logos.co/article/testnet-v0-1-review)
- [Anonymous Block Proposers — Logos Press Engine](https://press.logos.co/article/anonymous-block-proposers)
- [Testnet v0.1 FAQs](https://logos.co/testnet-v01-faqs)
- [Logos Blockchain GitHub](https://github.com/logos-blockchain/logos-blockchain)
- [Logos Quickstart Guide for the Blockchain Node](https://github.com/logos-co/logos-docs/blob/main/docs/blockchain/quickstart-guide-for-the-logos-blockchain-node.md)
- [Citizenweb3 chain-data-indexer (logos-indexer-v0.1.2)](https://github.com/citizenweb3/chain-data-indexer/tree/logos-indexer-v0.1.2)
- Public Logos RPC: `https://rpc.logos-testnet.citizenweb3.com`
- Citizenweb3 Logos indexer: `https://indexer.testnet-logos.citizenweb3.com`
- Industry context: [Cuiloa (Penumbra)](https://guide.penumbra.zone/frontend/cuiloa), [Aleoscan](https://aleoscan.io/validators), [Namada explorer case study](https://hack.bg/case-studies/case-study-shielded-live-namada-blockchain-explorer)
