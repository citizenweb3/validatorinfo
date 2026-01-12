# Services Module (Data Access Layer)

**Purpose:** Data access services providing a clean API for fetching and caching data from PostgreSQL database. Used by frontend components, server actions, and API routes.

## Key Files

| File | Description |
|------|-------------|
| `chain-service.ts` | Chain data: list, params, tokenomics, validators per chain, committee members |
| `validator-service.ts` | Validator data: list, nodes, voting power, filtering by ecosystem |
| `node-service.ts` | Node-level data: individual node info, consensus data |
| `proposal-service.ts` | Governance proposals: list, status, filtering |
| `vote-service.ts` | Voting data: votes by proposal, votes by validator |
| `price-service.ts` | Token prices: current and historical |
| `slashing-event-service.ts` | Slashing events for validators |
| `github-service.ts` | GitHub repository data for chains |
| `infrastructure-service.ts` | Infrastructure providers data |
| `search-service.ts` | Search functionality across chains and validators |
| `ecosystem-service.ts` | Ecosystem groupings and filtering |
| `stakingpage-service.ts` | Staking calculator data |
| `tokenomics-service.ts` | Tokenomics data (supply, inflation, etc.) |
| `blocks-service.ts` | Block data |
| `node-consensus-service.ts` | Consensus-specific node data |
| `aztec-db-service.ts` | Aztec database operations |
| `aztec-contracts-service.ts` | Aztec L1 contracts data |
| `aztec-vote-event-service.ts` | Aztec vote events |

## Dependencies

- `@/db` - Prisma client instance
- `@prisma/client` - Generated Prisma types
- `@/logger` - Logging utility
- `@/server/types` - Shared type definitions

## Used By

- `src/actions/*.ts` - Server actions call services
- `src/app/[locale]/**/page.tsx` - Server components fetch data via services
- `src/app/api/**` - API routes

## Structure

```
src/app/services/
├── chain-service.ts          # Chains and network data
├── validator-service.ts      # Validators and their nodes
├── node-service.ts           # Individual node data
├── proposal-service.ts       # Governance proposals
├── vote-service.ts           # Voting records
├── price-service.ts          # Token prices
├── slashing-event-service.ts # Slashing events
├── github-service.ts         # GitHub repositories
├── infrastructure-service.ts # Infrastructure providers
├── search-service.ts         # Search functionality
├── ecosystem-service.ts      # Ecosystem groupings
├── stakingpage-service.ts    # Staking calculator data
├── tokenomics-service.ts     # Tokenomics data
├── headerInfo-service.ts     # Header/navigation info
├── blocks-service.ts         # Block data
├── node-consensus-service.ts # Consensus-specific node data
│
├── aztec-indexer-api/        # Aztec-specific API client
│   └── *.ts                  # Aztec indexer endpoints
├── aztec-db-service.ts       # Aztec database operations
├── aztec-contracts-service.ts # Aztec L1 contracts
└── aztec-vote-event-service.ts # Aztec vote events
```

## Common Patterns

### 1. Service Object Pattern
Each service exports an object with methods:
```typescript
// chain-service.ts
const ChainService = {
  getAll,
  getById,
  getByName,
  getTokenPriceByChainId,
  getChainValidatorsWithNodes,
  getCommitteeMembers,
  getListByEcosystem,
  getAllLight,
};

export default ChainService;
```

### 2. Pagination Pattern
Most list methods support pagination with sorting:
```typescript
const getAll = async (
  ecosystems: string[],
  skip: number,
  take: number,
  sortBy: string = 'name',
  order: SortDirection = 'asc',
): Promise<{ items: Item[]; pages: number }> => {
  const where = ecosystems.length
    ? { ecosystem: { in: ecosystems } }
    : undefined;

  const items = await db.model.findMany({
    where,
    skip,
    take,
    orderBy: { [sortBy]: order },
    include: { params: true, tokenomics: true },
  });

  const count = await db.model.count({ where });
  return { items, pages: Math.ceil(count / take) };
};
```

### 3. Include Relations
Services often include related data via Prisma:
```typescript
const getById = async (id: number) => {
  return db.chain.findUnique({
    where: { id },
    include: {
      params: true,
      tokenomics: true,
      aprs: true,
    },
  });
};
```

### 4. Computed Fields
Some services compute derived values (e.g., voting power):
```typescript
const bondedTokens = parseFloat(chain?.tokenomics?.bondedTokens || '0');
const delegatorShares = parseFloat(node.delegatorShares || '0');
const votingPower = bondedTokens !== 0
  ? (delegatorShares / bondedTokens) * 100
  : 0;

return { ...node, votingPower };
```

### 5. Type Exports
Services export TypeScript types for use in components:
```typescript
export type ChainWithParams = Prisma.ChainGetPayload<{
  include: { params: true }
}>;

export type ChainWithParamsAndTokenomics = Prisma.ChainGetPayload<{
  include: { params: true; tokenomics: true }
}>;

export type ValidatorWithNodes = Validator & {
  nodes: Node[];
};

export type validatorNodesWithChainData = Node & {
  chain: ChainWithParamsAndTokenomics;
  votingPower: number;
  consensusData: NodesConsensusData | null;
};
```

### 6. Filtering Pattern
Common filtering by ecosystem, status, etc.:
```typescript
const where: any = { validatorId: id };

if (ecosystems.length > 0) {
  where.chain = { ecosystem: { in: ecosystems } };
}

if (nodeStatus.includes('jailed') && !nodeStatus.includes('unjailed')) {
  where.jailed = true;
} else if (nodeStatus.includes('unjailed') && !nodeStatus.includes('jailed')) {
  where.jailed = false;
}
```

### 7. Usage in Server Components
```typescript
// src/app/[locale]/networks/page.tsx
import ChainService from '@/services/chain-service';

export default async function NetworksPage({ searchParams }) {
  const { chains, pages } = await ChainService.getAll(
    [],      // ecosystems
    0,       // skip
    20,      // take
    'name',  // sortBy
    'asc'    // order
  );

  return <NetworksList chains={chains} pages={pages} />;
}
```

### 8. Usage in Server Actions
```typescript
// src/actions/chain-actions.ts
'use server';

import ChainService from '@/services/chain-service';

export async function getChainByName(name: string) {
  return ChainService.getByName(name);
}
```

### 9. Logging Pattern
Services use the logger for debugging:
```typescript
import logger from '@/logger';

const { logDebug, logError } = logger('validator-service');

const getById = async (id: number) => {
  logDebug(`Get validator by id: ${id}`);
  return db.validator.findUnique({ where: { id } });
};
```
