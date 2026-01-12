# Chains Module (Blockchain Implementations)

**Purpose:** Chain-specific implementations for fetching blockchain data (validators, proposals, staking params, APR, TVS, etc.)

## Key Files

| File | Description |
|------|-------------|
| `params.ts` | Master configuration for all supported blockchains (nodes, endpoints, denominations, metadata) |
| `chains.ts` | Array of chain names used by indexer for iteration |
| `methods.ts` | Registry mapping chain names to their method implementations |
| `chain-indexer.ts` | TypeScript interfaces for all chain methods (`ChainMethods`, `AddChainProps`, etc.) |
| `{chain-name}/methods.ts` | Chain-specific method implementations |

## Dependencies

- External blockchain APIs (REST, RPC, gRPC endpoints)
- `@prisma/client` - Database types
- `@/server/types` - Shared type definitions

## Used By

- `server/jobs/*.ts` - All indexer jobs use chain methods to fetch data
- `server/task-worker.ts` - Indirectly through jobs

## Structure

```
server/tools/chains/
├── params.ts             # Master config: all chains with endpoints, tokens, metadata
├── chains.ts             # Simple array of chain names for iteration
├── methods.ts            # Registry: maps chain name → ChainMethods object
├── chain-indexer.ts      # TypeScript interfaces and types
│
├── cosmoshub/            # Cosmos SDK based chains (template for most chains)
│   ├── methods.ts              # Exports ChainMethods object
│   ├── get-nodes.ts            # Fetch validators list
│   ├── get-apr.ts              # Calculate APR
│   ├── get-tvs.ts              # Total Value Staked
│   ├── get-proposals.ts        # Governance proposals
│   ├── get-staking-params.ts   # Unbonding time, max validators
│   ├── get-slashing-params.ts  # Slashing window, jail duration
│   ├── get-community-pool.ts   # Community pool balance
│   ├── get-inflation-rate.ts   # Inflation rate
│   └── get-*.ts                # Other chain data fetchers
│
├── namada/               # Custom implementation (different API)
├── ethereum/             # EVM-based implementation
├── polkadot/             # Substrate-based implementation
├── solana/               # Solana-specific implementation
├── aztec/                # Aztec L2 implementation (see aztec/AGENTS.md for details)
│   ├── AGENTS.md               # Comprehensive Aztec module documentation
│   ├── methods.ts
│   ├── get-nodes.ts
│   ├── get-proposals.ts
│   ├── sync-*-events.ts        # Event synchronization functions
│   ├── utils/                  # L1 contracts, ABIs, helpers
│   └── ...
│
├── celestia/             # Celestia (Cosmos-based with modifications)
├── osmosis/              # Osmosis DEX chain
├── neutron/              # Neutron chain
├── nym/                  # Nym mixnet
├── nomic/                # Nomic Bitcoin bridge
│
└── {other-chains}/       # Many chains reuse cosmoshub methods
```

## Common Patterns

### 1. ChainMethods Interface
Every chain must implement this interface from `chain-indexer.ts`:
```typescript
interface ChainMethods {
  getNodes: (chain: AddChainProps) => Promise<NodeResult[]>;
  getApr: (chain: AddChainProps) => Promise<number>;
  getTvs: (chain: AddChainProps) => Promise<ChainTVSResult | null>;
  getProposals: (chain: AddChainProps) => Promise<ProposalsResult>;
  getStakingParams: (chain: AddChainProps) => Promise<StakingParams>;
  getSlashingParams: (chain: AddChainProps) => Promise<SlashingChainParams>;
  getNodeParams: (chain: AddChainProps) => Promise<NodeParams>;
  getMissedBlocks: (chain, dbChain) => Promise<SlashingSigningInfos[]>;
  getNodesVotes: (chain, address) => Promise<NodeVote[]>;
  getCommTax: (chain: AddChainProps) => Promise<number | null>;
  getWalletsAmount: (chain: AddChainProps) => Promise<number | null>;
  getProposalParams: (chain: AddChainProps) => Promise<ProposalParams>;
  getNodeRewards: (chain: AddChainProps) => Promise<NodesRewards[]>;
  getNodeCommissions: (chain: AddChainProps) => Promise<NodesCommissions[]>;
  getCommunityPool: (chain: AddChainProps) => Promise<string | null>;
  getActiveSetMinAmount: (chain: AddChainProps) => Promise<string | null>;
  getInflationRate: (chain: AddChainProps) => Promise<number | null>;
  getCirculatingTokensOnchain: (chain, totalSupply?, communityPool?) => Promise<string | null>;
  getCirculatingTokensPublic: (chain: AddChainProps) => Promise<string | null>;
  getDelegatorsAmount: (chain: AddChainProps) => Promise<DelegatorsAmount[]>;
  getUnbondingTokens: (chain: AddChainProps) => Promise<string | null>;
  getChainUptime: (dbChain: Chain) => Promise<ChainUptime | null>;
  getRewardAddress: (chain, dbChainId) => Promise<RewardAddress[]>;
}
```

### 2. Method Implementation Pattern
```typescript
// get-nodes.ts
import { AddChainProps } from '@/server/tools/chains/chain-indexer';
import { NodeResult } from '@/server/types';

const getNodes = async (chain: AddChainProps): Promise<NodeResult[]> => {
  const restNode = chain.nodes.find((n) => n.type === 'rest');
  if (!restNode) return [];

  const response = await fetch(`${restNode.url}/cosmos/staking/v1beta1/validators`);
  const data = await response.json();

  return data.validators.map((v) => ({
    operatorAddress: v.operator_address,
    moniker: v.description.moniker,
    tokens: v.tokens,
    // ... transform to NodeResult
  }));
};

export default getNodes;
```

### 3. Chain Registration
```typescript
// methods.ts - register chain methods
import cosmosChainMethods from '@/server/tools/chains/cosmoshub/methods';
import aztecChainMethods from '@/server/tools/chains/aztec/methods';

const chainMethods: Record<string, ChainMethods> = {
  cosmoshub: cosmosChainMethods,
  aztec: aztecChainMethods,
  namada: namadaChainMethods,
  // Some chains reuse existing implementations:
  uptick: cosmosChainMethods,
  gravitybridge: cosmosChainMethods,
  althea: cosmosChainMethods,
  // Testnets often reuse mainnet methods:
  'aztec-testnet': aztecChainMethods,
  'namada-testnet': namadaChainMethods,
};

const getChainMethods = (chainName: string): ChainMethods => {
  const methods = chainMethods[chainName];
  if (!methods) {
    throw new Error(`Chain methods for ${chainName} not found`);
  }
  return methods;
};

export default getChainMethods;
```

### 4. Adding a New Chain
1. Add chain config to `params.ts` (endpoints, denom, coinGeckoId, bech32Prefix, etc.)
2. Add chain name to `chains.ts` array
3. Create `{chain-name}/` folder with `methods.ts` and `get-*.ts` files
4. Register in `methods.ts` registry
5. If similar to existing chain, can reuse: `newchain: cosmosChainMethods`

### 5. Node Types in params.ts
```typescript
interface AddChainProps {
  chainId: string;
  name: string;
  prettyName: string;
  denom: string;
  minimalDenom: string;
  coinDecimals: number;
  coinGeckoId: string;
  bech32Prefix: string;
  nodes: {
    type: 'rest' | 'rpc' | 'grpc' | 'indexer' | 'ws' | 'exit' | 'entry';
    url: string;
    provider?: string;
  }[];
  // ... other fields
}
```

### 6. Ecosystem Types
Chains are grouped by ecosystem for filtering:
- `cosmos` - Cosmos SDK chains
- `ethereum` - EVM chains
- `polkadot` - Substrate chains
- `solana` - Solana
- `aztec` - Aztec L2
