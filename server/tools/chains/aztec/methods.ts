import getChainUptime from '@/server/tools/chains/aztec/get-chain-uptime';
import getMissedBlocks from '@/server/tools/chains/aztec/get-missed-blocks';
import getNodes from '@/server/tools/chains/aztec/get-nodes';
import getSlashingParams from '@/server/tools/chains/aztec/get-slashing-params';
import getTvs from '@/server/tools/chains/aztec/get-tvs';
import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import getNodeParams from '@/server/tools/chains/ethereum/get-node-params';
import getStakingParams from '@/server/tools/chains/ethereum/get-staking-params';

const chainMethods: ChainMethods = {
  getNodes,
  getStakingParams,
  getTvs,
  getMissedBlocks,
  getSlashingParams,
  getApr: async () => 0,
  getNodeParams,
  getProposals: async () => ({
    proposals: [],
    total: 0,
    live: 0,
    passed: 0,
  }),
  getNodesVotes: () => Promise.resolve([]),
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
