# Aztec Chain Module

**Purpose:** Aztec L2 blockchain-specific implementations for fetching validators (providers/attesters), governance proposals, staking events, slashing data, rewards, and network metrics from Ethereum L1 contracts.

## Architecture Overview

Aztec is an Ethereum L2 (Layer 2) that uses L1 contracts for consensus, staking, and governance. Unlike Cosmos-based chains that use REST/RPC APIs directly, Aztec module reads data from smart contracts on Ethereum mainnet (for `aztec`) or Sepolia testnet (for `aztec-testnet`).

```
┌──────────────────────────────────────────────────────────────────┐
│                         AZTEC MODULE                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐     ┌─────────────────────────────────────┐│
│  │   methods.ts    │────▶│        Chain Method Functions       ││
│  │ (entry point)   │     │  getNodes, getProposals, getApr...  ││
│  └─────────────────┘     └─────────────────────────────────────┘│
│                                      │                           │
│                    ┌─────────────────┴─────────────────┐        │
│                    ▼                                   ▼        │
│  ┌─────────────────────────────┐   ┌───────────────────────────┐│
│  │      L1 Contract Calls       │   │    Event Synchronization  ││
│  │  - StakingRegistry          │   │  - syncStakedEvents       ││
│  │  - Rollup                    │   │  - syncAttesterEvents    ││
│  │  - Governance               │   │  - syncSlashingEvents    ││
│  │  - GSE (governance staking) │   │  - syncVoteEvents        ││
│  └─────────────────────────────┘   └───────────────────────────┘│
│                    │                           │                 │
│                    ▼                           ▼                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                       utils/                                 ││
│  │  - contracts/contracts-config.ts (ABI, addresses)           ││
│  │  - contracts/l1-contracts.ts (mainnet/testnet addresses)    ││
│  │  - get-providers.ts, get-provider-attesters.ts              ││
│  │  - get-total-supply.ts, get-bonded-tokens.ts                ││
│  │  - fetch-provider-metadata.ts                               ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                  Ethereum L1 (Mainnet/Sepolia)                   │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────────┐│
│  │StakingRegistry│  │   Rollup      │  │   Governance          ││
│  │ - providers   │  │ - slots       │  │ - proposals           ││
│  │ - attesters   │  │ - rewards     │  │ - votes               ││
│  │ - staking     │  │ - slashing    │  │ - state               ││
│  └───────────────┘  └───────────────┘  └───────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

---

## Key Files

### Core Methods

| File | Description |
|------|-------------|
| `methods.ts` | Entry point - exports `ChainMethods` object with all chain functions |
| `get-nodes.ts` | Fetches all sequencers (delegated + self-staked) from events DB |
| `get-proposals.ts` | Fetches governance proposals from L1 Governance contract |
| `get-apr.ts` | **@deprecated** - APR now synced from `ChainAprHistory` by `update-aztec-apr-history` job |
| `get-tvs.ts` | **@deprecated** - TVS now synced from `ChainTvsHistory` by `update-aztec-tvs-history` job |
| `get-nodes-rewards.ts` | Fetches sequencer rewards per validator from Rollup contract |
| `get-missed-blocks.ts` | Fetches missed proposals/attestations via Aztec RPC |
| `get-chain-uptime.ts` | Gets slot duration and current slot from Rollup |
| `get-slashing-params.ts` | Returns static slashing window (768 blocks) |
| `get-node-stake.ts` | Fetches individual validator stake amounts |
| `get-proposal-params.ts` | Fetches governance proposal parameters (quorum, voting period, etc.) |

### Event Synchronization

| File | Description |
|------|-------------|
| `sync-staked-events.ts` | Syncs `StakedWithProvider` events from StakingRegistry |
| `sync-attester-events.ts` | Syncs `AttestersAddedToProvider` events (single-pass, no provider iteration) |
| `sync-slashing-events.ts` | Syncs `Slashed` events from Rollup contract |
| `sync-vote-events.ts` | Syncs `VoteCast` events from Governance contract |
| `sync-signal-events.ts` | Syncs `Signaled` events from GovernanceProposer contract |
| `sync-payload-submitted-events.ts` | Syncs `PayloadSubmitted` events from GovernanceProposer contract |
| `sync-validator-queued-events.ts` | Syncs `ValidatorQueued` events (sequencer registration) |
| `sync-withdraw-initiated-events.ts` | Syncs `WithdrawInitiated` events (sequencer unbonding start) |
| `sync-withdraw-finalized-events.ts` | Syncs `WithdrawFinalized` events (sequencer exit complete) |
| `sync-aztec-providers.ts` | Syncs Aztec providers from StakingRegistry contract |

### Shared Types

| File | Description |
|------|-------------|
| `types.ts` | Shared TypeScript interfaces (`SyncResult` for event sync results) |

### Helpers

| File | Description |
|------|-------------|
| `find-or-create-aztec-validator.ts` | Finds or creates a global Validator record by providerAdmin address |

### APR/TVS Calculation Utilities

| File | Description |
|------|-------------|
| `utils/count-blocks-for-day.ts` | Counts blocks produced on a specific day using binary search on Aztec Indexer |
| `utils/get-reward-config.ts` | Gets reward configuration (blockReward, sequencerBps) from Rollup contract |
| `utils/get-total-staked-for-day.ts` | Calculates total staked for a day (queued - withdrawn - slashed) |
| `utils/get-unbonded-tokens.ts` | Calculates total unbonded tokens from WithdrawFinalized events |
| `utils/get-unbonding-tokens.ts` | Calculates unbonding tokens (WithdrawInitiated - WithdrawFinalized) |

### Tokenomics Sync Utilities

| File | Description |
|------|-------------|
| `utils/sync-apr-to-tokenomics.ts` | Syncs latest APR from `ChainAprHistory` to `tokenomics` table |
| `utils/sync-tvs-to-tokenomics.ts` | Syncs latest TVS, bondedTokens, unbondedTokens from history to `tokenomics` |

---

## Directory Structure

```
server/tools/chains/aztec/
├── methods.ts                       # ChainMethods export (entry point)
├── get-nodes.ts                     # Fetch providers + attesters
├── get-proposals.ts                 # Fetch governance proposals
├── get-apr.ts                       # @deprecated - APR synced from history
├── get-tvs.ts                       # @deprecated - TVS synced from history
├── get-nodes-rewards.ts             # Fetch sequencer rewards
├── get-missed-blocks.ts             # Fetch missed proposals/attestations
├── get-chain-uptime.ts              # Get slot duration and current slot
├── get-slashing-params.ts           # Static slashing params
├── get-node-stake.ts                # Fetch validator stakes
├── get-proposal-params.ts           # Fetch governance proposal params (quorum, delays)
├── find-or-create-aztec-validator.ts # Validator upsert helper
├── sync-staked-events.ts            # Sync StakedWithProvider events
├── sync-attester-events.ts          # Sync AttestersAddedToProvider events (single-pass)
├── sync-slashing-events.ts          # Sync Slashed events
├── sync-vote-events.ts              # Sync VoteCast events
├── sync-signal-events.ts            # Sync Signaled events from GovernanceProposer
├── sync-payload-submitted-events.ts # Sync PayloadSubmitted events
├── sync-validator-queued-events.ts  # Sync ValidatorQueued events (sequencer registration)
├── sync-withdraw-initiated-events.ts # Sync WithdrawInitiated events (unbonding start)
├── sync-withdraw-finalized-events.ts # Sync WithdrawFinalized events (sequencer exit)
├── sync-aztec-providers.ts          # Sync providers from StakingRegistry
├── types.ts                         # Shared TypeScript interfaces (SyncResult)
│
├── utils/
│   ├── contracts/
│   │   ├── contracts-config.ts      # Contract addresses, ABIs, L1 mapping
│   │   ├── l1-contracts.ts          # Mainnet/Testnet L1 addresses
│   │   └── abis/
│   │       ├── aztec/               # Mainnet ABIs
│   │       │   ├── GOVERNANCE_ABI.json
│   │       │   ├── GOVERNANCE_PROPOSER_ABI.json
│   │       │   ├── GSE_ABI.json
│   │       │   ├── GSE_PAYLOAD_ABI.json
│   │       │   ├── ROLLUP_ABI.json
│   │       │   ├── STAKING_REGISTRY_ABI.json
│   │       │   └── TOKEN_ABI.json
│   │       └── aztec-testnent/      # Testnet ABIs (note: directory name has typo)
│   │           └── ... (same structure)
│   │
│   ├── get-providers.ts             # Fetch all providers from StakingRegistry
│   ├── get-provider-attesters.ts    # Map attesters to providers (reads from DB only)
│   ├── get-active-sequencers.ts     # Get active sequencers from ValidatorQueued - Withdrawals
│   ├── get-bonded-tokens.ts         # Get total bonded tokens (minus slashed amounts)
│   ├── get-total-supply.ts          # Get total token supply
│   ├── get-total-prover-rewards.ts  # Get prover rewards from tokenomics
│   ├── get-active-attester-count.ts # Count active attesters
│   ├── get-committee-size.ts        # Get current committee size
│   ├── get-current-epoch.ts         # Get current epoch number
│   ├── get-current-slot.ts          # Get current slot number
│   ├── get-epoch-duration.ts        # Get epoch duration in slots
│   ├── get-epoch-progress.ts        # Get epoch progress percentage
│   ├── get-current-epoch-committee.ts # Get committee for current epoch
│   ├── get-l1-contract-addresses.ts # Fetch L1 contract addresses dynamically
│   ├── get-chunck-size-rpc.ts       # Determine chunk size for RPC providers
│   ├── get-l1-rpc-urls.ts           # Get L1 RPC URLs for Aztec chain
│   ├── get-exited-sequencers.ts     # Get sequencers that have exited (from WithdrawFinalized events)
│   ├── get-governance-config.ts     # Get governance configuration from contract
│   ├── get-governance-power.ts      # Get governance voting power (total, per-user, current and historical)
│   ├── get-payload-uri-util.ts      # Utility for fetching payload URI content
│   ├── get-proposal-ballots.ts      # Get user's vote ballot (yea/nay) for a specific proposal
│   ├── fetch-delegated-stake.ts     # Fetch delegated stake for attester
│   ├── fetch-node-stake.ts          # Fetch stake for specific node
│   ├── fetch-provider-metadata.ts   # Fetch provider names from JSON/API
│   ├── fetch-block-timestamps.ts    # Batch fetch block timestamps for events
│   ├── fetch-events-with-retry.ts   # Adaptive retry logic for fetching events
│   ├── build-address-to-validator-map.ts # Build map of addresses to validator info
│   ├── providers_monikers.json      # Static provider name mappings
│   │
│   │   # APR/TVS Calculation Utilities
│   ├── count-blocks-for-day.ts      # Count blocks for a day via Aztec Indexer
│   ├── get-reward-config.ts         # Get reward config from Rollup contract
│   ├── get-total-staked-for-day.ts  # Calculate historical staked amount
│   ├── get-unbonded-tokens.ts       # Sum of WithdrawFinalized amounts
│   ├── get-unbonding-tokens.ts      # Initiated - Finalized = pending withdrawals
│   │
│   │   # Tokenomics Sync Utilities
│   ├── sync-apr-to-tokenomics.ts    # Sync APR from ChainAprHistory to tokenomics
│   └── sync-tvs-to-tokenomics.ts    # Sync TVS + unbonded from history to tokenomics
│
└── AGENTS.md                        # This documentation
```

---

## L1 Contract Integration

### Contract Configuration

```typescript
// utils/contracts/contracts-config.ts
export const getL1: Record<string, string> = {
  'aztec-testnet': 'ethereum-sepolia',
  aztec: 'ethereum',
};

export const contracts = {
  aztec: aztecMainnet,       // from l1-contracts.ts
  'aztec-testnet': aztecTestnet,
};
```

### Key L1 Contracts

| Contract | Purpose |
|----------|---------|
| `StakingRegistry` | Provider registration, staking, attesters |
| `Rollup` | Block validation, rewards, slashing, epoch/slot info |
| `Governance` | Proposals, voting, execution |
| `GovernanceProposer` | Sequencer signaling for proposals |
| `GSE` (Governance Staking Escrow) | Token locking for governance |
| `Token` | Aztec native token (same as stakingAsset on mainnet) |

### L1 Contract Addresses (Mainnet)

```typescript
// utils/contracts/l1-contracts.ts
export const aztecMainnet = {
  registryAddress: '0x35b22e09ee0390539439e24f06da43d83f90e298',
  rollupAddress: '0x603bb2c05d474794ea97805e8de69bccfb3bca12',
  stakingRegistryAddress: '0x042dF8f42790d6943F41C25C2132400fd727f452',
  governanceAddress: '0x1102471eb3378fee427121c9efcea452e4b6b75e',
  governanceProposerAddress: '0x06ef1dcf87e419c48b94a331b252819fadbd63ef',
  gseAddress: '0xa92ecfd0e70c9cd5e5cd76c50af0f7da93567a4f',
  tokenAddress: '0xA27EC0006e59f245217Ff08CD52A7E8b169E62D2',
  // ... more addresses
};
```

---

## Key Patterns

### 1. L1 RPC URL Resolution

All functions first resolve L1 RPC URLs from the parent chain config:

```typescript
const chainName = chain.name as 'aztec' | 'aztec-testnet';
const l1Chain = getChainParams(getL1[chainName]); // 'ethereum' or 'ethereum-sepolia'
const l1RpcUrls = l1Chain.nodes
  .filter((n) => n.type === 'rpc')
  .map((n) => n.url);
```

### 2. Contract Calls with Failover

Use `createViemClientWithFailover` or `readContractWithFailover` for resilient L1 calls:

```typescript
import { createViemClientWithFailover } from '@/server/utils/viem-client-with-failover';

const client = createViemClientWithFailover(l1RpcUrls, {
  loggerName: `${chainName}-get-proposals`,
});

const result = await client.readContract({
  address: contractAddress as `0x${string}`,
  abi: abi,
  functionName: 'proposalCount',
});
```

### 3. Event Synchronization Pattern

All sync functions follow the same pattern:

```typescript
export const syncXxxEvents = async (
  chainName: 'aztec' | 'aztec-testnet',
  dbChain: { id: number },
  l1RpcUrls: string[],
): Promise<SyncResult> => {
  // 1. Get last synced block from events DB
  const lastEvent = await eventsClient.aztecXxxEvent.findFirst({
    where: { chainId: dbChain.id },
    orderBy: { blockNumber: 'desc' },
  });

  // 2. Determine start block (last synced + 1 or deployment block)
  const startBlock = lastEvent
    ? BigInt(lastEvent.blockNumber) + BigInt(1)
    : deploymentBlocks[chainName];

  // 3. Fetch events in chunks (to avoid RPC limits)
  for (let blockStart = startBlock; blockStart < currentBlock; blockStart += BigInt(chunkSize)) {
    const events = await client.getContractEvents({...});
    // Process and save each event
  }

  return { success: true, totalEvents, newEvents, skippedEvents };
};
```

### 4. Validator Identification (Self-Staked vs Delegated)

Aztec has two types of sequencers:

- **Delegated sequencers**: Stake through a provider (infrastructure operator)
- **Self-staked sequencers**: Stake directly without a provider

**How it works:**

1. `ValidatorQueued` event = sequencer registered (from Rollup contract)
2. `WithdrawFinalized` event = sequencer exited (from Rollup contract)
3. `AttestersAddedToProvider` event = attester delegated to provider (from StakingRegistry)

**Identification logic in `get-nodes.ts`:**

```typescript
// 1. Get ALL active sequencers from ValidatorQueued - WithdrawFinalized
const activeSequencers = await getActiveSequencers(dbChain.id);

// 2. Get attester->provider mapping from AttestersAddedToProvider events
const attesterToProvider = await getProviderAttesters(l1RpcUrls, chainName);

// 3. For each active sequencer:
for (const attesterAddress of activeSequencers.keys()) {
  const providerId = attesterToProvider.get(attesterAddress);

  if (providerId) {
    // Has provider = DELEGATED
    delegatedCount++;
    node.moniker = provider.name;
  } else {
    // No provider = SELF-STAKED
    selfStakedCount++;
    node.moniker = `Sequencer ${shortAddress}`;
  }
}
```

**Data flow:**

```
┌─────────────────────────────────────────────────────────────┐
│                    get-nodes.ts                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────┐    ┌──────────────────────────┐  │
│  │ getActiveSequencers  │    │  getProviderAttesters    │  │
│  │    (from DB)         │    │       (from DB)          │  │
│  └──────────┬───────────┘    └───────────┬──────────────┘  │
│             │                            │                  │
│             ▼                            ▼                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Merge: active sequencers + provider mapping   │  │
│  │                                                        │  │
│  │  IF attester IN providerMapping → DELEGATED           │  │
│  │  IF attester NOT IN providerMapping → SELF-STAKED     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Events Database Models

Events are stored in the separate events database (`prisma/events/schema.prisma`):

```prisma
model AztecStakedEvent {
  id                          Int      @id @default(autoincrement())
  chainId                     Int
  blockNumber                 String
  transactionHash             String
  logIndex                    Int
  providerId                  String
  providerAddress             String
  rollupAddress               String
  attesterAddress             String
  coinbaseSplitContractAddress String?
  stakerImplementation        String?
  timestamp                   DateTime

  @@unique([chainId, transactionHash, logIndex])
}

model AztecAttesterEvent {
  id              Int      @id @default(autoincrement())
  chainId         Int
  blockNumber     String
  transactionHash String
  logIndex        Int
  providerId      String
  providerAddress String
  attesters       String[] // Array of attester addresses
  timestamp       DateTime

  @@unique([chainId, transactionHash, logIndex])
}

model AztecSlashedEvent {
  id              Int      @id @default(autoincrement())
  chainId         Int
  blockNumber     String
  transactionHash String
  logIndex        Int
  attester        String
  amount          String
  timestamp       DateTime

  @@unique([chainId, transactionHash, logIndex])
}

model AztecVoteCastEvent {
  id              Int      @id @default(autoincrement())
  chainId         Int
  blockNumber     String
  transactionHash String
  logIndex        Int
  proposalId      String
  voter           String
  support         Boolean
  amount          String
  timestamp       DateTime

  @@unique([chainId, transactionHash, logIndex])
}

model AztecSignalCastEvent {
  id              Int      @id @default(autoincrement())
  chainId         Int
  blockNumber     String
  transactionHash String
  logIndex        Int
  payload         String   // GSE Payload address being signaled for
  round           String   // Signaling round number
  signaler        String   // Sequencer address that signaled
  timestamp       DateTime

  @@unique([chainId, transactionHash, logIndex])
}

model AztecPayloadSubmittedEvent {
  id              Int      @id @default(autoincrement())
  chainId         Int
  blockNumber     String
  transactionHash String
  logIndex        Int
  payload         String   // GSE Payload address submitted
  round           String   // Round in which payload was submitted
  timestamp       DateTime

  @@unique([chainId, transactionHash, logIndex])
}

model AztecValidatorQueuedEvent {
  id              Int      @id @default(autoincrement())
  chainId         Int
  blockNumber     String
  transactionHash String
  logIndex        Int
  attester        String   // Sequencer address that registered
  timestamp       DateTime

  @@unique([chainId, transactionHash, logIndex])
  @@index([chainId, attester])
}

model AztecWithdrawFinalizedEvent {
  id              Int      @id @default(autoincrement())
  chainId         Int
  blockNumber     String
  transactionHash String
  logIndex        Int
  attester        String   // Sequencer address that exited
  recipient       String   // Address that received the stake
  amount          String   // Amount withdrawn
  timestamp       DateTime

  @@unique([chainId, transactionHash, logIndex])
  @@index([chainId, attester])
}

model AztecWithdrawInitiatedEvent {
  id              Int      @id @default(autoincrement())
  chainId         Int
  blockNumber     String
  transactionHash String
  logIndex        Int
  attester        String   // Sequencer address starting unbonding
  recipient       String   // Address that will receive the stake
  amount          String   // Amount being unbonded
  timestamp       DateTime

  @@unique([chainId, transactionHash, logIndex])
  @@index([chainId, attester])
}
```

---

## APR and TVS Data Flow

**Important:** APR and TVS are now managed by dedicated history jobs, not the generic chain jobs.

### Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    APR / TVS Data Flow (Aztec)                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  L1 Events (ValidatorQueued, WithdrawFinalized, Slashed)                │
│       │                                                                  │
│       ▼                                                                  │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────┐  │
│  │ update-aztec-apr-history job    │  │ update-aztec-tvs-history job │  │
│  │ (server/jobs/)                  │  │ (server/jobs/)               │  │
│  │                                 │  │                              │  │
│  │ - Counts blocks per day         │  │ - Calculates daily TVS       │  │
│  │ - Calculates daily APR          │  │ - Stores in ChainTvsHistory  │  │
│  │ - Stores in ChainAprHistory     │  │                              │  │
│  └───────────────┬─────────────────┘  └──────────────┬───────────────┘  │
│                  │                                   │                   │
│                  ▼                                   ▼                   │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                    Sync Utilities (utils/)                          ││
│  │  syncAprToTokenomics()              syncTvsToTokenomics()           ││
│  │  - Reads latest from history        - Reads latest from history     ││
│  │  - Writes to tokenomics.apr         - Writes to tokenomics.tvs      ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                   │                                      │
│                                   ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                    tokenomics table                                 ││
│  │  (apr, tvs, bondedTokens, totalSupply, unbondedTokens)             ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                   │                                      │
│                                   ▼                                      │
│                              UI Components                               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Why Not Generic Jobs?

The generic `update-chain-apr` and `update-chain-tvs` jobs call `methods.ts` callbacks.
For Aztec, these return `null` to signal "skip processing" because:

1. **APR** requires block count from Aztec Indexer API (not available in generic job)
2. **TVS** is calculated from events history (more accurate than L1 calls)
3. **History tables** provide time-series data for charts

**Important:** The `getApr`/`getTvs` callbacks return `null` (not `0`) to signal skip.
This is because `0` is a valid APR value for some chains (e.g., govgen, neutron, stride).
The generic jobs check for `apr === null` to skip processing.

### APR Calculation (in history job)

The APR history job uses utilities from `utils/`:

```typescript
import { countBlocksForDay } from '@/server/tools/chains/aztec/utils/count-blocks-for-day';
import { getRewardConfig } from '@/server/tools/chains/aztec/utils/get-reward-config';
import { getTotalStakedForDay } from '@/server/tools/chains/aztec/utils/get-total-staked-for-day';

// Per day:
const rewardConfig = await getRewardConfig(chainName);  // From Rollup contract
const blocksCount = await countBlocksForDay(date);      // Binary search in Aztec Indexer
const totalStaked = await getTotalStakedForDay(chainId, date);  // From events

const rewards = blocksCount * rewardConfig.blockReward * rewardConfig.sequencerBps / 10000;
const apr = (rewards / totalStaked) * 365;
```

**Note:** Only sequencer rewards (not prover rewards) are included in APR calculation.

### TVS Sync (includes unbondedTokens)

```typescript
import { getUnbondedTokens } from '@/server/tools/chains/aztec/utils/get-unbonded-tokens';

// syncTvsToTokenomics reads from ChainTvsHistory and calculates unbondedTokens:
const unbondedTokens = await getUnbondedTokens(chainId);  // Sum of WithdrawFinalized.amount
```

---

## Governance Proposals

### Proposal States

| State | Code | Mapped Status |
|-------|------|---------------|
| Pending | 0 | DEPOSIT_PERIOD |
| Active | 1 | VOTING_PERIOD |
| Queued | 2 | PASSED |
| Executable | 3 | PASSED |
| Executed | 4 | PASSED |
| Rejected | 5 | REJECTED |
| Dropped | 6 | FAILED |

### Proposal Data Structure

```typescript
interface ProposalData {
  config: {
    votingDelay: bigint;
    votingDuration: bigint;
    executionDelay: bigint;
    gracePeriod: bigint;
    quorum: bigint;
    requiredYeaMargin: bigint;
    minimumVotes: bigint;
  };
  cachedState: number;
  payload: string;
  proposer: string;
  creation: bigint;
  summedBallot: {
    yea: bigint;
    nay: bigint;
  };
}
```

---

## Dependencies

### External

- `viem` - Ethereum client library for L1 contract interactions
- Ethereum L1 RPC endpoints (from `ethereum` or `ethereum-sepolia` chain params)
- Aztec RPC endpoints (for `node_getValidatorsStats`)

### Internal

- `@/db` - Main Prisma client
- `@/db#eventsClient` - Events database Prisma client
- `@/logger` - Structured logging
- `@/server/utils/viem-client-with-failover` - Resilient contract calls
- `@/server/utils/json-rpc-client` - JSON-RPC calls with failover
- `@/server/tools/chains/params` - Chain configuration
- `@/server/tools/chains/chain-indexer` - TypeScript interfaces
- `@/server/tools/chains/ethereum/get-staking-params` - Reused from Ethereum module
- `@/server/tools/chains/ethereum/get-node-params` - Reused from Ethereum module

---

## Used By

- `server/jobs/aztec-sync-events.ts` - Syncs all Aztec events (staked, attesters, slashing, votes)
- `server/jobs/update-aztec-apr-history.ts` - Calculates daily APR using `count-blocks-for-day`, `get-reward-config`, `get-total-staked-for-day`
- `server/jobs/update-aztec-tvs-history.ts` - Calculates daily TVS using `get-unbonded-tokens`
- `server/jobs/proposals.ts` - Updates proposal data
- `server/jobs/validators.ts` - Updates validator/node data
- `server/jobs/chain-aprs.ts` - Skipped for Aztec (returns `null`)
- `server/jobs/chain-tvls.ts` - Skipped for Aztec (returns `null`)
- `server/jobs/node-rewards.ts` - Updates reward data
- `server/jobs/missed-blocks.ts` - Updates uptime/missed blocks

---

## Adding New Functionality

### Adding a New Contract Method

1. **Add ABI** to `utils/contracts/abis/aztec/` and `utils/contracts/abis/aztec-testnent/`
2. **Update contracts-config.ts** to export the new ABI:
   ```typescript
   import NEW_ABI from './abis/aztec/NEW_ABI.json';
   export const newAbis = { aztec: NEW_ABI, 'aztec-testnet': NEW_ABI_TESTNET };
   ```
3. **Create the function** following the L1 call pattern
4. **Export from methods.ts** if it's a ChainMethods function

### Adding a New Event Sync

1. **Add Prisma model** to `prisma/events/schema.prisma`
2. **Run migration**: `npx prisma migrate dev --name add_new_event`
3. **Create sync function** following `sync-*-events.ts` pattern
4. **Add to job** in `server/jobs/aztec-sync-events.ts`

### Testing

```bash
# Check types
yarn build

# Test specific functionality (example)
npx ts-node -r tsconfig-paths/register scripts/test-aztec-proposals.ts
```

---

## Common Issues

### 1. No L1 RPC URLs

Ensure `ethereum` or `ethereum-sepolia` chain in `params.ts` has RPC nodes configured.

### 2. Contract Call Failures

- Check if deployment block is correct in `deploymentBlocks`
- Verify contract address matches the network (mainnet vs testnet)
- Use chunk-based fetching to avoid RPC limits

### 3. Missing Provider Metadata

Provider names come from `utils/providers_monikers.json` or external API. Update this file for new providers.

---

## Related Documentation

- `server/tools/chains/AGENTS.md` - Parent chains module documentation
- `server/jobs/AGENTS.md` - Indexer jobs documentation
