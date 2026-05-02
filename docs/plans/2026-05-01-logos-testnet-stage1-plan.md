# Logos Testnet Integration — Stage 1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Зарегистрировать Logos testnet v0.1.2 как chain в ValidatorInfo, реализовать единственный рабочий метод `getChainUptime` через citizenweb3 indexer; остальные методы — безопасные stubs. Никаких изменений в Prisma schema, никаких новых jobs, никаких новых общих утилит.

**Architecture:** Новый chain `logos-testnet` в новом ecosystem `logos`. Один рабочий метод `getChainUptime` дёргает `GET /api/v1/stats` на citizenweb3 indexer'е (Bearer auth из env), возвращает `{lastUptimeUpdated, uptimeHeight=node_height, avgTxInterval=2000ms}`. 22 остальных метода `ChainMethods` — null/empty stubs. Флаг `hasValidators: false` отрубает 7 валидаторных jobs автоматически.

**Tech Stack:** TypeScript, inline `fetch()` с Bearer auth (паттерн `solana/get-nodes.ts`), `getChainParams` для чтения `nodes`-массива (паттерн `aztec/get-chain-uptime.ts`), `ChainNodeType: 'indexer'` (уже существует в `chain-indexer.ts:9`).

**Источник дизайна:** `docs/plans/2026-05-01-logos-testnet-integration-design.md` (revision 3, итерация 3).

---

## Файлы

| # | Действие | Путь |
|---|---|---|
| 1 | CREATE | `server/tools/chains/logos-testnet/types.ts` |
| 2 | CREATE | `server/tools/chains/logos-testnet/get-chain-uptime.ts` |
| 3 | CREATE | `server/tools/chains/logos-testnet/methods.ts` |
| 4 | CREATE | `server/tools/chains/logos-testnet/AGENTS.md` |
| 5 | MODIFY | `server/tools/chains/params.ts` (добавить ecosystem `logos`, добавить chain `logos-testnet`) |
| 6 | MODIFY | `server/tools/chains/methods.ts` (импорт + ключ в `chainMethods`) |
| 7 | MODIFY | `.env.example` (добавить `LOGOS_INDEXER_API_TOKEN=""`) |

UI и localization файлы НЕ трогаются (Stage 1 = только indexer-часть, страница сети — Stage 2).

---

## Task 1: Создать `types.ts`

**Files:**
- Create: `server/tools/chains/logos-testnet/types.ts`

**Step 1: Записать содержимое файла**

```ts
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
```

**Step 2: Проверка типов**

Run: `npx tsc --noEmit server/tools/chains/logos-testnet/types.ts`
Expected: no output (тип валиден).

---

## Task 2: Реализовать `get-chain-uptime.ts`

**Files:**
- Create: `server/tools/chains/logos-testnet/get-chain-uptime.ts`

**Зависит от:** Task 1 (импортирует `LogosStats`).

**Step 1: Записать содержимое файла**

```ts
import { Chain } from '@prisma/client';

import logger from '@/logger';
import { GetChainUptime } from '@/server/tools/chains/chain-indexer';
import { LogosStats } from '@/server/tools/chains/logos-testnet/types';
import { getChainParams } from '@/server/tools/chains/params';

const { logError, logWarn } = logger('logos-chain-uptime');

const CRYPTARCHIA_SLOT_DURATION_MS = 2000;
const REQUEST_TIMEOUT_MS = 8000;

const getChainUptime: GetChainUptime = async (dbChain: Chain) => {
  const params = getChainParams(dbChain.name);
  const indexerUrl = params.nodes.find((n) => n.type === 'indexer')?.url;
  const token = process.env.LOGOS_INDEXER_API_TOKEN;

  if (!indexerUrl) {
    logError(`${dbChain.name} - no indexer URL in params.ts nodes`);
    return null;
  }
  if (!token) {
    logWarn(`${dbChain.name} - LOGOS_INDEXER_API_TOKEN not set, skipping uptime fetch`);
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
      logError(`${dbChain.name} - indexer /api/v1/stats returned ${res.status}`);
      return null;
    }

    const stats = (await res.json()) as LogosStats;

    if (typeof stats.node_height !== 'number') {
      logError(`${dbChain.name} - invalid stats response: ${JSON.stringify(stats)}`);
      return null;
    }

    return {
      lastUptimeUpdated: new Date(),
      uptimeHeight: stats.node_height,
      avgTxInterval: CRYPTARCHIA_SLOT_DURATION_MS,
    };
  } catch (e) {
    logError(`${dbChain.name} - fetch /api/v1/stats failed`, e);
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

export default getChainUptime;
```

**Step 2: Проверка типов**

Run: `npx tsc --noEmit` (из корня проекта, проверит весь tsconfig)
Expected: zero new errors.

---

## Task 3: Реализовать `methods.ts` (stubs + uptime)

**Files:**
- Create: `server/tools/chains/logos-testnet/methods.ts`

**Зависит от:** Task 2.

**Step 1: Записать содержимое файла**

```ts
import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import getChainUptime from '@/server/tools/chains/logos-testnet/get-chain-uptime';

// Logos — privacy-preserving PoS testnet (Cryptarchia + Blend mix-network).
// Anonymous block proposers (one-time leader_keys) + ZK-hidden stake make
// the standard ValidatorInfo Cosmos shape inapplicable. Stage 1 implements
// only getChainUptime via citizenweb3 indexer; everything else is null/[].
// hasValidators: false in params.ts skips 7 validator-centric jobs.
// See docs/plans/2026-05-01-logos-testnet-integration-design.md
const chainMethods: ChainMethods = {
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
  getChainUptime,
  getRewardAddress: async () => [],
};

export default chainMethods;
```

**Step 2: Проверка полноты `ChainMethods`**

Open `server/tools/chains/chain-indexer.ts:164-188` и сверь, что все 23 ключа интерфейса присутствуют в нашем объекте. Expected: ровно 23 ключа, ничего не пропущено.

**Step 3: Проверка типов**

Run: `npx tsc --noEmit`
Expected: zero new errors. Если TypeScript ругается, что какой-то ключ отсутствует — добавить тот, что не хватает.

---

## Task 4: Создать `AGENTS.md` модуля

**Files:**
- Create: `server/tools/chains/logos-testnet/AGENTS.md`

**Step 1: Записать содержимое файла**

```markdown
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

URL'ы хранятся в `params.ts` через `nodes` массив с типами `'indexer'` и `'rpc'`. Bearer-токен — в `LOGOS_INDEXER_API_TOKEN` env.

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
```

---

## Task 5: Зарегистрировать ecosystem `logos` и chain `logos-testnet` в `params.ts`

**Files:**
- Modify: `server/tools/chains/params.ts`

**Step 1: Добавить ecosystem `logos` в `ecosystemParams`**

В файле `server/tools/chains/params.ts` после строки 51 (`}, // конец polkadot ecosystem`) и перед строкой 52 (`];`) добавить новый объект:

```ts
  {
    name: 'logos',
    prettyName: 'Logos',
    logoUrl: 'https://raw.githubusercontent.com/citizenweb3/staking/refs/heads/chain-images/logos/logos.svg',
    tags: ['Privacy', 'PoS', 'Cryptarchia', 'Anonymous Proposers'],
  },
```

**ВАЖНО**: `logoUrl` — placeholder. После того, как SVG зальётся в `citizenweb3/staking` репу (см. design doc Open question 1), URL может потребовать корректировки.

**Step 2: Добавить chain `logos-testnet` в `chainParams`**

Найти существующую запись `'aztec-testnet': {` (строка 1219). После закрывающей скобки этого блока (строка 1246, `},` перед пустой строкой) добавить новый блок:

```ts
  'logos-testnet': {
    rang: 3,
    ecosystem: 'logos',
    hasValidators: false,
    name: 'logos-testnet',
    prettyName: 'Logos Testnet',
    shortDescription: 'Privacy-preserving PoS testnet with anonymous block proposers (Cryptarchia + Blend)',
    chainId: 'logos-testnet-v0.1.2',
    bech32Prefix: '',
    coinDecimals: 0,
    coinGeckoId: '',
    coinType: 0,
    denom: '',
    minimalDenom: '',
    logoUrl: 'https://raw.githubusercontent.com/citizenweb3/staking/refs/heads/chain-images/logos/logos.svg',
    nodes: [
      { type: 'rpc', url: 'https://rpc.logos-testnet.citizenweb3.com', provider: 'citizenweb3' },
      { type: 'indexer', url: 'https://indexer.testnet-logos.citizenweb3.com', provider: 'citizenweb3' },
    ],
    mainRepo: 'https://github.com/logos-blockchain/logos-blockchain',
    docs: 'https://logos.co/testnet-v01-faqs',
    githubUrl: 'https://github.com/logos-blockchain',
    twitterUrl: 'https://x.com/Logos_State',
    tags: ['Logos Ecosystem', 'Testnet', 'Privacy', 'Cryptarchia'],
  },
```

**Заметка по полям**: `denom`, `minimalDenom`, `bech32Prefix`, `coinGeckoId` — пустые: на v0.1.2 нет публичного нативного токена с тикером, нет bech32 (Cryptarchia использует свой формат адресов), нет CoinGecko-листинга. `coinDecimals: 0` и `coinType: 0` — placeholder; обновятся, когда токен появится.

**Step 3: Проверка типов**

Run: `npx tsc --noEmit`
Expected: zero new errors. Если `AddChainProps` ругается на отсутствующее поле — добавь его (вероятно `telegramUrl`, `discordInviteCode` — оба опциональны и могут быть пропущены).

---

## Task 6: Зарегистрировать `logosTestnetChainMethods` в `chainMethods`

**Files:**
- Modify: `server/tools/chains/methods.ts`

**Зависит от:** Task 3.

**Step 1: Добавить импорт**

В файле `server/tools/chains/methods.ts` после строки 21 (`import aztecChainMethods from '@/server/tools/chains/aztec/methods';`) добавить:

```ts
import logosTestnetChainMethods from '@/server/tools/chains/logos-testnet/methods';
```

**Step 2: Добавить ключ в `chainMethods` Record**

В том же файле, перед закрывающей скобкой объекта `chainMethods` (строка 64, `};`), добавить:

```ts
  'logos-testnet': logosTestnetChainMethods,
```

**Step 3: Проверка типов**

Run: `npx tsc --noEmit`
Expected: zero new errors.

---

## Task 7: Добавить `LOGOS_INDEXER_API_TOKEN` в `.env.example`

**Files:**
- Modify: `.env.example`

**Step 1: Добавить блок в конец файла**

В конец файла `.env.example` добавить:

```
# ============================================
# Logos Testnet
# ============================================

# Bearer token for citizenweb3 Logos indexer (https://indexer.testnet-logos.citizenweb3.com)
# Required for getChainUptime to fetch /api/v1/stats. If empty, getChainUptime returns null with a warning.
LOGOS_INDEXER_API_TOKEN=""
```

---

## Task 8: Smoke test (lint + build + indexer запуск)

**Зависит от:** Tasks 1-7.

**Step 1: Lint**

Run: `yarn lint`
Expected: no new warnings/errors в файлах `server/tools/chains/logos-testnet/**`, `server/tools/chains/methods.ts`, `server/tools/chains/params.ts`.

**Step 2: Build**

Run: `yarn build`
Expected: `Compiled successfully` (TypeScript zero errors).

**Step 3: Локальный индексер smoke-test**

a. Установить токен в локальный `.env`:
```
LOGOS_INDEXER_API_TOKEN=<ask the user for the actual token>
```

b. Временно ограничить indexer одной сетью. Открыть `server/tools/chains/chains.ts`, найти `aztec-only mode` (см. memory `project_indexer_aztec_only_mode.md`) и заменить на `logos-only`. Возможные варианты:
   - Если стоит `includeChains: ['aztec-testnet']` — заменить на `includeChains: ['logos-testnet']`.
   - Если стоит закомментированный массив — раскомментировать с `'logos-testnet'`.

c. Запустить indexer:
```bash
docker compose -f docker-compose.dev.yml up -d --build
```

d. Дождаться, пока пройдёт первый цикл `chain-uptime` крона (несколько минут), затем проверить логи:
```bash
docker compose -f docker-compose.dev.yml logs indexer 2>&1 | grep -i "logos\|chain-uptime"
```

Expected:
- НЕ видно exception/stack traces для chain `logos-testnet`.
- Видно одну из:
   - `info: logos-chain-uptime ... uptime updated` (успех — `node_height` пришёл)
   - `warn: logos-chain-uptime ... LOGOS_INDEXER_API_TOKEN not set` (если забыли токен)

e. Проверить БД:
```bash
docker compose -f docker-compose.dev.yml exec postgres psql -U postgres -d validatorinfo -c \
  "SELECT name, ecosystem, has_validators, uptime_height, last_uptime_updated FROM \"Chain\" WHERE name = 'logos-testnet';"
```

Expected:
- Строка существует.
- `ecosystem = 'logos'`, `has_validators = false`.
- `uptime_height` — число (~80000+ на 2026-05-01), `last_uptime_updated` — недавняя метка времени.

**Step 4: Откатить временные изменения**

Вернуть `chains.ts` в исходное состояние (если это был aztec-only mode — вернуть aztec; если был prod-режим — оставить filter с `'logos-testnet'` добавленным к существующему aztec-only набору, сверившись с пользователем).

**Step 5: Финальный build**

Run: `yarn build`
Expected: `Compiled successfully`.

---

## Definition of Done (Stage 1)

- [ ] Файлы 1–4 созданы в `server/tools/chains/logos-testnet/`.
- [ ] `params.ts` содержит ecosystem `logos` и chain `logos-testnet`.
- [ ] `methods.ts` импортирует и регистрирует `logosTestnetChainMethods`.
- [ ] `.env.example` содержит `LOGOS_INDEXER_API_TOKEN=""` с комментарием.
- [ ] `yarn lint` чист.
- [ ] `yarn build` зелёный.
- [ ] Локальный indexer smoke test пройден: `Chain` запись создана, `uptime_height > 0`, нет exception'ов в логах.
- [ ] `chains.ts` возвращён к состоянию, согласованному с пользователем.
- [ ] Все 23 ключа `ChainMethods` присутствуют в `logos-testnet/methods.ts`.

## Out of scope (Stage 2)

- UI-страница `/networks/logos-testnet` (stats card, latest blocks list, block detail page).
- Локализация (`messages/{en,pt,ru}.json`) — Stage 1 не добавляет user-facing текстов.
- Утилита `utils/fetch-logos-indexer.ts` — экстрактим в Stage 2, когда станет ≥3 server-actions, делающих HTTP-вызовы к индексеру (см. design doc § Этап 2 пункт 7).
