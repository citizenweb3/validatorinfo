import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import cosmosChainMethods from '@/server/tools/chains/cosmoshub/methods';
import getApr from '@/server/tools/chains/namada/get-apr';
import getNodes from '@/server/tools/chains/namada/get-nodes';
import getProposals from '@/server/tools/chains/namada/get-proposals';
import getStakingParams from '@/server/tools/chains/namada/get-staking-params';
import getTvs from '@/server/tools/chains/namada/get-tvs';
import getNodesVotes from '@/server/tools/chains/namada/get-nodes-votes';

const chainMethods: ChainMethods = {
  ...cosmosChainMethods,
  getNodes,
  getTvs,
  getApr,
  getStakingParams,
  getProposals,
  getNodesVotes,
};

export default chainMethods;
