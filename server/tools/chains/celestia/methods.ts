import getCirculatingTokens from '@/server/tools/chains/celestia/get-circulating-tokens';
import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import cosmosChainMethods from '@/server/tools/chains/cosmoshub/methods';

const chainMethods: ChainMethods = { ...cosmosChainMethods, getCirculatingTokens };

export default chainMethods;
