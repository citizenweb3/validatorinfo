import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import cosmosChainMethods from '@/server/tools/chains/cosmoshub/methods';
import getCirculatingTokens from '@/server/tools/chains/dymension/get-circulating-tokens';

const chainMethods: ChainMethods = { ...cosmosChainMethods, getCirculatingTokens };

export default chainMethods;
