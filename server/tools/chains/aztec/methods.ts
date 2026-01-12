import getApr from '@/server/tools/chains/aztec/get-apr';
import getChainUptime from '@/server/tools/chains/aztec/get-chain-uptime';
import getMissedBlocks from '@/server/tools/chains/aztec/get-missed-blocks';
import getNodeRewards from '@/server/tools/chains/aztec/get-nodes-rewards';
import getNodes from '@/server/tools/chains/aztec/get-nodes';
import getProposalParams from '@/server/tools/chains/aztec/get-proposal-params';
import getProposals from '@/server/tools/chains/aztec/get-proposals';
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
  getApr,
  getNodeParams,
  getProposals,
  getNodesVotes: () => Promise.resolve([]),
  getCommTax: async () => null,
  getWalletsAmount: async () => null,
  getProposalParams,
  getNodeRewards,
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
