import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import cosmosChainMethods from '@/server/tools/chains/cosmoshub/methods';
import getCirculatingTokensPublic from '@/server/tools/chains/nym/get-circulating-tokens-public';

const chainMethods: ChainMethods = {
  ...cosmosChainMethods,
  getCirculatingTokensPublic,
};

export default chainMethods;
