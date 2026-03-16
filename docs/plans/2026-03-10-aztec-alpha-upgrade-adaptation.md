# Aztec Alpha Upgrade — Adaptation Design

**Date:** 2026-03-10
**Updated:** 2026-03-16
**Status:** Partially Implemented, Awaiting Mainnet Activation
**Related:** `docs/plans/2026-03-08-aztec-dynamic-l1-contracts-impl.md`

---

## 1. Background

Aztec is transitioning to a new Rollup contract via the **Alpha Upgrade**. This upgrade is **live on testnet** (Sepolia) and pending governance vote on **mainnet** (~March 30, 2026).

ValidatorInfo indexes Aztec L1 events (attesters, staking, governance, providers) for both `aztec` (mainnet) and `aztec-testnet`. Most contract addresses auto-update via the `update-aztec-l1-contracts` job, but some config values require manual updates.

---

## 2. Architecture: How Contract Addresses Work

### Two-layer address resolution

```
┌─────────────────────────────────────────────────────────────┐
│  update-aztec-l1-contracts job (every 6 hours)              │
│  Calls node_getL1ContractAddresses RPC → stores in DB       │
│  Exception: stakingRegistryAddress always from hardcode      │
└────────────────────────┬────────────────────────────────────┘
                         │ writes to chainParams.l1ContractsAddresses
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  getContracts(chainName) — contracts-config.ts              │
│  1. Read from DB (dynamic, updated by job)                  │
│  2. Fallback to hardcoded l1-contracts.ts                    │
└────────────────────────┬────────────────────────────────────┘
                         │ used by 30 files
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  All sync-*, get-*, utils/* files                           │
│  Exception: get-chain-uptime.ts used static contracts[]     │
│  → FIXED in this branch to use getContracts()               │
└─────────────────────────────────────────────────────────────┘
```

### What auto-updates via RPC (no action needed)

| Address | Source | Auto-updates? |
|---------|--------|---------------|
| rollupAddress | `node_getL1ContractAddresses` RPC | Yes |
| governanceAddress | RPC | Yes |
| governanceProposerAddress | RPC | Yes |
| gseAddress | RPC | Yes |
| registryAddress | RPC | Yes |
| stakingAssetAddress | RPC | Yes |

### What requires manual update

| Address | Why | When |
|---------|-----|------|
| stakingRegistryAddress | Not returned by RPC (from `ignition-contracts`, not `aztec-packages`). Job hardcodes it from `l1-contracts.ts` (line 45 of `update-aztec-l1-contracts.ts`) | Only if StakingRegistry redeploys |
| deploymentBlocks | Hardcoded in `contracts-config.ts` | After new contract deployments |

---

## 3. What Changes in Alpha Upgrade

From the [Alpha Upgrade proposal](https://forum.aztec.network/t/alpha-upgrade-is-ready-for-proposal/8511):

**Contracts that change:**
- Rollup → new contract `0xae2001f7e21d5ecabf6234e9fdd1e76f50f74962` (deployed March 4, not yet activated)
- HonkVerifier → new contract
- Slasher → new contract

**Contracts that do NOT change:**
- StakingRegistry (`0x042dF8f42790d6943F41C25C2132400fd727f452`) — uses ROLLUP_REGISTRY to resolve rollup dynamically
- Governance, GovernanceProposer, GSE, Token — same addresses

**Config changes:**
- Mana target: 0 → 75M (~1.25 TPS)
- Checkpoint rewards: 400 → 500 AZTEC
- Committee size: 24 → 48
- Governance execution delay: 7 → 30 days (applies to FUTURE proposals, not this one)

---

## 4. StakingRegistry Architecture (Verified)

StakingRegistry lives in [`AztecProtocol/ignition-contracts`](https://github.com/AztecProtocol/ignition-contracts), NOT in `aztec-packages`. It is a delegated staking orchestration layer.

**Key finding from [source code](https://github.com/AztecProtocol/ignition-contracts/blob/master/src/staking-registry/StakingRegistry.sol):**

```solidity
IRegistry public immutable ROLLUP_REGISTRY;
// In stake():
address rollupAddress = ROLLUP_REGISTRY.getRollup(_rollupVersion);
```

StakingRegistry resolves the rollup address **dynamically** via the Registry contract. When Alpha Upgrade registers the new Rollup in the Registry, StakingRegistry automatically uses it. **No address change, no ABI change, no code change needed.**

Events remain identical:
- `StakedWithProvider`, `AttestersAddedToProvider`, `ProviderRegistered`, `ProviderAdminUpdated`

Testnet StakingRegistry (`0xC6EcC1832c8BF6a41c927BEb4E9ec610FBeDd1C2`) verified active on Sepolia Etherscan — 947 transactions, last activity March 11, 2026.

---

## 5. Impact Analysis: What Breaks After Mainnet Activation

### Will NOT break (auto-updates via getContracts → DB)

All 30 files using `getContracts()` will pick up the new rollupAddress within 6 hours (next `update-aztec-l1-contracts` run):

- All `sync-*-events.ts` (13 files)
- All `utils/get-*.ts` (14 files)
- `get-proposals.ts`, `get-nodes-rewards.ts`

Event sync files resume from `lastEvent.blockNumber + 1` — they will see no events until the new Rollup starts emitting, then pick up seamlessly.

### Was broken, FIXED in this branch

| File | Issue | Fix |
|------|-------|-----|
| `get-chain-uptime.ts` | Used static `contracts[chainName]` instead of `getContracts()` | Changed to dynamic access |

### Requires manual update after activation

| What | File | Action |
|------|------|--------|
| `deploymentBlocks['aztec']` | `contracts-config.ts:90` | Update to the L1 block where Alpha Upgrade activates |
| Mainnet ROLLUP_ABI | `abis/aztec/ROLLUP_ABI.json` | Verify ABI compatibility with new Rollup, update if needed |

### Safe (no change needed)

| Component | Why safe |
|-----------|---------|
| StakingRegistry sync | Address doesn't change |
| Governance/Vote sync | Address doesn't change |
| GovernanceProposer sync | Address doesn't change |
| APR/TVS history jobs | Read events from DB + current Rollup state (dynamic) |
| Node distribution job | Reads events from DB |
| Validator logos job | No L1 dependency |
| Committee sync job | Reads current epoch state (no historical dependency) |

---

## 6. Fixes Applied in This Branch

### Fix 1: Testnet StakingRegistry Address

**File:** `l1-contracts.ts:15`

```diff
- stakingRegistryAddress: '0xc3860c45e5F0b1eF3000dbF93149756f16928ADB'
+ stakingRegistryAddress: '0xC6EcC1832c8BF6a41c927BEb4E9ec610FBeDd1C2'
```

**Why:** Old address points to disconnected contract from November 2025 deployment. New address verified active on [Sepolia Etherscan](https://sepolia.etherscan.io/address/0xC6EcC1832c8BF6a41c927BEb4E9ec610FBeDd1C2).

### Fix 2: Testnet Deployment Block

**File:** `contracts-config.ts:91`

```diff
- 'aztec-testnet': 7300000
+ 'aztec-testnet': 9842614
```

**Why:** 7,300,000 was from old testnet deployment. 9,842,614 is the GSE/Registry creation block — earliest contract in current testnet deployment. Verified on Etherscan.

### Fix 3: ROLLUP_ABI Import Path

**File:** `contracts-config.ts:10`

```diff
- import ROLLUP_AZTEC_TESTNET from '.../abis/aztec/ROLLUP_ABI.json';
+ import ROLLUP_AZTEC_TESTNET from '.../abis/aztec-testnent/ROLLUP_ABI.json';
```

**Why:** Testnet was importing mainnet ROLLUP_ABI. Currently identical (same MD5), but will diverge after Alpha Upgrade hits mainnet.

### Fix 4: get-chain-uptime.ts Static → Dynamic

**File:** `get-chain-uptime.ts:26`

```diff
- const contractAddress = contracts[dbChain.name as AztecChainName].rollupAddress;
+ const l1Contracts = await getContracts(chainName);
+ const contractAddress = l1Contracts.rollupAddress;
```

**Why:** Was the only file (out of 30) using hardcoded `contracts[]` instead of `getContracts()`. Would break when rollupAddress changes on mainnet.

---

## 7. Post-Activation Runbook (Mainnet ~March 30, 2026)

When the Alpha Upgrade governance proposal executes:

### Step 1: Verify activation (within hours)

```bash
# Check if new Rollup is receiving epoch roots
# New Rollup: 0xae2001f7e21d5ecabf6234e9fdd1e76f50f74962
# Etherscan: https://etherscan.io/address/0xae2001f7e21d5ecabf6234e9fdd1e76f50f74962
```

### Step 2: Verify auto-update worked

Check that `update-aztec-l1-contracts` job picked up the new rollupAddress:
- Indexer logs: look for `aztec: Successfully updated L1 contract addresses`
- DB: `chainParams.l1ContractsAddresses` should contain new rollupAddress

### Step 3: Update deployment block (code change)

**File:** `server/tools/chains/aztec/utils/contracts/contracts-config.ts`

```typescript
// Change this line:
aztec: 21550000,
// To the L1 block where Alpha Upgrade activated:
aztec: <ACTIVATION_BLOCK>,
```

This ensures event sync doesn't miss events between old Rollup's last event and new Rollup's first event.

### Step 4: Verify ROLLUP_ABI compatibility

Compare `abis/aztec/ROLLUP_ABI.json` against the verified ABI of the new Rollup contract (`0xae2001f7...`) on Etherscan. If events or functions changed, update the ABI file.

Key events to verify:
- `Deposit`, `ValidatorQueued`, `Slashed`
- `WithdrawInitiated`, `WithdrawFinalized`
- `LocalEjectionThresholdUpdated`

### Step 5: Deploy and monitor

After code change:
1. `yarn lint && yarn build`
2. Deploy
3. Monitor for 24 hours:
   - `sync-aztec-events` job finds new events
   - `update-aztec-apr-history` calculates correct APR
   - `update-aztec-node-distribution` shows correct validator counts

---

## 8. Key Addresses Reference

### Testnet (Sepolia) — Current

Source: [docs.aztec.network/networks](https://docs.aztec.network/networks)

| Contract | Address | Deployment Block |
|----------|---------|-----------------|
| Registry | `0xa0bfb1b494fb49041e5c6e8c2c1be09cd171c6ba` | 9,842,614 |
| GSE | `0xb6a38a51a6c1de9012f9d8ea9745ef957212eaac` | 9,842,614 |
| Rollup | `0xf6d0d42ace06829becb78c74f49879528fc632c1` | 10,391,387 |
| StakingRegistry | `0xC6EcC1832c8BF6a41c927BEb4E9ec610FBeDd1C2` | 10,049,301 |
| Governance | `0xcaf7447721447b22cd0076ac7c63877c3afd329f` | — |
| GovernanceProposer | `0x01c7d4ca153748d2377968fef22894cb162e9480` | — |

### Mainnet — Current (Pre-Alpha)

| Contract | Address | Changes in Alpha? |
|----------|---------|-------------------|
| Rollup | `0x603bb2c05d474794ea97805e8de69bccfb3bca12` | Yes → `0xae2001f7e21d5ecabf6234e9fdd1e76f50f74962` |
| StakingRegistry | `0x042dF8f42790d6943F41C25C2132400fd727f452` | No |
| Governance | `0x1102471eb3378fee427121c9efcea452e4b6b75e` | No |
| GovernanceProposer | `0x06ef1dcf87e419c48b94a331b252819fadbd63ef` | No |
| GSE | `0xa92ecfd0e70c9cd5e5cd76c50af0f7da93567a4f` | No |

---

## 9. New Contracts (Not Critical for Indexer)

Alpha Upgrade introduces new contracts. None require indexing — all slashing outcomes still emit `Slashed` events on the Rollup (which we already track).

| Contract | Purpose | Own Events | Critical? |
|----------|---------|------------|-----------|
| Slasher | Receives slash proposals, calls `IStakingCore.slash()` on Rollup | `VetoedPayload`, `SlashingDisabled` | No |
| RewardBooster | Activity-based reward multipliers | None | No |
| SlashFactory | Creates slash payload contracts | `SlashPayloadCreated` | No |
| TallySlashingProposer | Decentralized slash voting | `VoteCast`, `RoundExecuted` | No (optional for future dashboard) |

Sources: [Slasher.sol](https://github.com/AztecProtocol/aztec-packages/blob/master/l1-contracts/src/core/slashing/Slasher.sol), [RewardBooster.sol](https://github.com/AztecProtocol/aztec-packages/blob/master/l1-contracts/src/core/reward-boost/RewardBooster.sol)

---

## 10. Governance Timeline

| Date | Event | Status |
|------|-------|--------|
| March 4 | Payload + new contracts deployed | Done |
| March 6 | Payload verified on-chain | Done |
| March 10 | Aztec Labs bytecode verification | Done |
| ~March 13 | Sequencer signaling completes | Done (estimated) |
| ~March 16 | Voting begins | Current (estimated) |
| ~March 23 | Voting ends | Pending |
| ~March 30 | Execution (7-day delay) | Pending |

Source: [Forum post](https://forum.aztec.network/t/alpha-upgrade-is-ready-for-proposal/8511)

Note: The current execution delay is 7 days (not 30). Alpha Upgrade changes it to 30 days, but that applies to FUTURE proposals.

---

## 11. Sources

- [Aztec Networks — Official Contract Addresses](https://docs.aztec.network/networks)
- [AztecProtocol/ignition-contracts — StakingRegistry](https://github.com/AztecProtocol/ignition-contracts)
- [IStaking.sol — aztec-packages](https://github.com/AztecProtocol/aztec-packages/blob/master/l1-contracts/src/core/interfaces/IStaking.sol)
- [GSE.sol — aztec-packages](https://github.com/AztecProtocol/aztec-packages/blob/master/l1-contracts/src/governance/GSE.sol)
- [StakingRegistry.sol — ignition-contracts](https://github.com/AztecProtocol/ignition-contracts/blob/master/src/staking-registry/StakingRegistry.sol)
- [Alpha Upgrade Forum Post](https://forum.aztec.network/t/alpha-upgrade-is-ready-for-proposal/8511)
- [Alpha Payload Forum Post](https://forum.aztec.network/t/proposal-aztec-alpha-payload/8515)
- [Sepolia Etherscan — StakingRegistry](https://sepolia.etherscan.io/address/0xC6EcC1832c8BF6a41c927BEb4E9ec610FBeDd1C2)
- [Etherscan — Governance Contract](https://etherscan.io/address/0x1102471eb3378fee427121c9efcea452e4b6b75e)
