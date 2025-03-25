import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import getApr from '@/server/tools/chains/cosmoshub/get-apr';
import getMainParams from '@/server/tools/chains/cosmoshub/get-main-params';
import getNodes from '@/server/tools/chains/cosmoshub/get-nodes';
import getTvl from '@/server/tools/chains/cosmoshub/get-tvl';

const chainMethods: ChainMethods = {
  getNodes,
  getApr,
  getTvl,
  getMainParams,
};

export default chainMethods;
