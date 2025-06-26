import getProposals from '@/server/tools/chains/atomone/get-proposals';
import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import cosmosChainMethods from '@/server/tools/chains/cosmoshub/methods';
import getProposalParams from '@/server/tools/chains/atomone/get-proposal-params';

const chainMethods: ChainMethods = {
  ...cosmosChainMethods,
  getProposals,
  getProposalParams,
};

export default chainMethods;
