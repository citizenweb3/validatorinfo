import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import cosmosChainMethods from '@/server/tools/chains/cosmoshub/methods';
import getApr from '@/server/tools/chains/namada/get-apr';
import getNodes from '@/server/tools/chains/namada/get-nodes';
import getTvl from '@/server/tools/chains/namada/get-tvl';

const chainMethods: ChainMethods = {
  ...cosmosChainMethods,
  getNodes,
  getTvl,
  getApr,
};

export default chainMethods;
