import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import getNodes from '@/server/tools/chains/polkadot/get-nodes';
import getStakingParams from '@/server/tools/chains/polkadot/get-staking-params';
import getTvs from '@/server/tools/chains/polkadot/get-tvs';

const chainMethods: ChainMethods = {
  getNodes,
  getStakingParams,
  getTvs,
  getMissedBlocks: () => Promise.resolve([]),
  getSlashingParams: () => Promise.resolve({ blocksWindow: null, jailedDuration: null }),
  getApr: async () => 0,
  getNodeParams: async () => ({
    peers: null,
    seeds: null,
    daemonName: null,
    nodeHome: null,
    keyAlgos: null,
    binaries: null,
    genesis: null,
  }),
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
  getCommPool: async () => null,
  getActiveSetMinAmount: async () => null,
};

export default chainMethods;
