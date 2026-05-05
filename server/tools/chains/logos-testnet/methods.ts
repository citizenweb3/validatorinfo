import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import getAvgFee from '@/server/tools/chains/logos-testnet/get-avg-fee';
import getChainUptime from '@/server/tools/chains/logos-testnet/get-chain-uptime';
import getTotalTxs from '@/server/tools/chains/logos-testnet/get-total-txs';
import getTps from '@/server/tools/chains/logos-testnet/get-tps';
import getTxsLast24h from '@/server/tools/chains/logos-testnet/get-txs-last-24h';

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
  getTotalTxs,
  getTxsLast24h,
  getTps,
  getAvgFee,
};

export default chainMethods;
