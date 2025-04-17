import getProposals from '@/server/tools/chains/atomone/get-proposals';
import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import cosmosChainMethods from '@/server/tools/chains/cosmoshub/methods';

const chainMethods: ChainMethods = { ...cosmosChainMethods, getProposals };

export default chainMethods;
