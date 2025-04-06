import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import cosmosChainMethods from '@/server/tools/chains/cosmoshub/methods';
import getProposals from '@/server/tools/chains/space-pussy/get-proposals';

const chainMethods: ChainMethods = { ...cosmosChainMethods, getProposals };

export default chainMethods;
