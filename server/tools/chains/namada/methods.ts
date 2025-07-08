import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import cosmosChainMethods from '@/server/tools/chains/cosmoshub/methods';
import getActiveSetMinAmount from '@/server/tools/chains/namada/get-active-set-min-amount';
import getApr from '@/server/tools/chains/namada/get-apr';
import getInflationRate from '@/server/tools/chains/namada/get-inflation-rate';
import getMissedBlocks from '@/server/tools/chains/namada/get-missed-blocks';
import getNodes from '@/server/tools/chains/namada/get-nodes';
import getNodesVotes from '@/server/tools/chains/namada/get-nodes-votes';
import getProposals from '@/server/tools/chains/namada/get-proposals';
import getSlashingParams from '@/server/tools/chains/namada/get-slashing-params';
import getStakingParams from '@/server/tools/chains/namada/get-staking-params';
import getTvs from '@/server/tools/chains/namada/get-tvs';

const chainMethods: ChainMethods = {
  ...cosmosChainMethods,
  getNodes,
  getTvs,
  getApr,
  getStakingParams,
  getProposals,
  getNodesVotes,
  getCommTax: async () => null,
  getWalletsAmount: async () => null,
  getSlashingParams,
  getMissedBlocks,
  getProposalParams: async () => ({
    creationCost: null,
    votingPeriod: null,
    participationRate: null,
    quorumThreshold: null,
  }),
  getActiveSetMinAmount,
  getInflationRate,
};

export default chainMethods;
