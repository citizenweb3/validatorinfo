import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import nullTxMetrics from '@/server/tools/chains/null-tx-metrics';

const chainMethods: ChainMethods = {
  ...nullTxMetrics,
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
  getChainUptime: async () => null,
  getRewardAddress: async () => [],
};

export default chainMethods;
