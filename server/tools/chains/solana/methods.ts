import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import getMissedBlocks from '@/server/tools/chains/solana/get-missed-blocks';
import getCirculatingTokensOnchain from '@/server/tools/chains/solana/get-circulating-tokens-onchain';
import getCirculatingTokensPublic from '@/server/tools/chains/solana/get-circulating-tokens-public';
import getNodes from '@/server/tools/chains/solana/get-nodes';
import getSlashingParams from '@/server/tools/chains/solana/get-slashing-params';
import getStakingParams from '@/server/tools/chains/solana/get-staking-params';
import getTvs from '@/server/tools/chains/solana/get-tvs';
import getInflationRate from "@/server/tools/chains/solana/get-inflation-rate";

const chainMethods: ChainMethods = {
  getNodes,
  getStakingParams,
  getTvs,
  getSlashingParams,
  getMissedBlocks,
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
  getNodeRewards: async () => [],
  getChainRewards: async () => null,
  getCommPool: async () => null,
  getActiveSetMinAmount: async () => null,
  getCirculatingTokensOnchain,
  getCirculatingTokensPublic,
  getInflationRate,
};

export default chainMethods;
