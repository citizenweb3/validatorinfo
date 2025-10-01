import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import cosmosChainMethods from '@/server/tools/chains/cosmoshub/methods';
import getCirculatingTokensPublic from '@/server/tools/chains/nym/get-circulating-tokens-public';
import getCommunityPool from "@/server/tools/chains/nym/get-community-pool";

const chainMethods: ChainMethods = {
  ...cosmosChainMethods,
  getCirculatingTokensPublic,
  getCommunityPool,
};

export default chainMethods;
