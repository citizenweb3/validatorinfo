import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import cosmosChainMethods from '@/server/tools/chains/cosmoshub/methods';
import getApr from '@/server/tools/chains/stride/get-apr';

const chainMethods: ChainMethods = { ...cosmosChainMethods, getApr };

export default chainMethods;
