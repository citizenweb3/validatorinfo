import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import cosmosChainMethods from '@/server/tools/chains/cosmoshub/methods';
import getApr from '@/server/tools/chains/neutron/get-apr';
import getCirculatingTokensPublic from '@/server/tools/chains/neutron/get-circulating-tokens-public';
import getProposals from '@/server/tools/chains/neutron/get-proposals';
import getTvs from '@/server/tools/chains/neutron/get-tvs';

const chainMethods: ChainMethods = {
  ...cosmosChainMethods,
  getApr,
  getTvs,
  getProposals,
  getCirculatingTokensPublic,
};

export default chainMethods;
