import getCirculatingTokensPublic from '@/server/tools/chains/bostrom/get-circulating-tokens-public';
import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import cosmosChainMethods from '@/server/tools/chains/cosmoshub/methods';
import getCommunityPool from "@/server/tools/chains/bostrom/get-community-pool";

const chainMethods: ChainMethods = {
  ...cosmosChainMethods,
  getCirculatingTokensPublic,
  getCommunityPool,
};

export default chainMethods;
