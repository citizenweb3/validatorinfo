import getCirculatingTokensPublic from '@/server/tools/chains/celestia/get-circulating-tokens-public';
import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import cosmosChainMethods from '@/server/tools/chains/cosmoshub/methods';
import getInflationRate from "@/server/tools/chains/celestia/get-inflation-rate";

const chainMethods: ChainMethods = {
  ...cosmosChainMethods,
  getCirculatingTokensPublic,
  getInflationRate,
};

export default chainMethods;
