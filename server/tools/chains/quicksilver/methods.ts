import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import cosmosChainMethods from '@/server/tools/chains/cosmoshub/methods';
import getApr from '@/server/tools/chains/quicksilver/get-apr';
import getCirculatingTokensPublic from '@/server/tools/chains/quicksilver/get-circulating-tokens-public';

const chainMethods: ChainMethods = {
  ...cosmosChainMethods,
  getApr,
  getCirculatingTokensPublic,
};

export default chainMethods;
