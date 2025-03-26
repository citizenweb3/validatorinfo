import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import getApr from '@/server/tools/chains/cosmoshub/get-apr';
import getNodes from '@/server/tools/chains/cosmoshub/get-nodes';
import getStakingParams from '@/server/tools/chains/cosmoshub/get-staking-params';
import getTvl from '@/server/tools/chains/cosmoshub/get-tvl';

const chainMethods: ChainMethods = {
  getNodes,
  getApr,
  getTvl,
  getStakingParams,
};

export default chainMethods;
