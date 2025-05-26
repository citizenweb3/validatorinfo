import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import getNodes from '@/server/tools/chains/ethereum/get-nodes';
import getStakingParams from '@/server/tools/chains/ethereum/get-staking-params';
import getTvs from '@/server/tools/chains/ethereum/get-tvs';
import getNodeParams from '@/server/tools/chains/ethereum/get-node-params';

const chainMethods: ChainMethods = {
  getNodes,
  getStakingParams,
  getTvs,
  getSlashingNodesInfos: () => Promise.resolve([]),
  getSlashingParams: () => Promise.resolve({ blocksWindow: null, jailedDuration: null }),
  getApr: async () => 0,
  getNodeParams,
  getProposals: async () => ({
    proposals: [],
    total: 0,
    live: 0,
    passed: 0,
  }),
  getNodesVotes: () => Promise.resolve([]),
};

export default chainMethods;
