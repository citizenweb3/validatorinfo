import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import cosmosChainMethods from '@/server/tools/chains/cosmoshub/methods';
import getApr from '@/server/tools/chains/govgen/get-apr';
import getProposals from '@/server/tools/chains/govgen/get-proposals';

const chainMethods: ChainMethods = { ...cosmosChainMethods, getApr, getProposals };

export default chainMethods;
