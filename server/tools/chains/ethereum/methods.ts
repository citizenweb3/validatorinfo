import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import getMissedBlocks from '@/server/tools/chains/ethereum/get-missed-blocks';
import getNodeParams from '@/server/tools/chains/ethereum/get-node-params';
import getNodes from '@/server/tools/chains/ethereum/get-nodes';
import getSlashingParams from '@/server/tools/chains/ethereum/get-slashing-params';
import getStakingParams from '@/server/tools/chains/ethereum/get-staking-params';
import getTvs from '@/server/tools/chains/ethereum/get-tvs';

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
  getChainRewards: async () => null,
  getCommunityPool: async () => null,
  getActiveSetMinAmount: async () => null,
  getInflationRate: async () => null,
  getCirculatingTokensOnchain: async () => null,
  getCirculatingTokensPublic: async () => null,
};

export default chainMethods;
