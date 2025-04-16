import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import getApr from '@/server/tools/chains/cosmoshub/get-apr';
import getNodes from '@/server/tools/chains/cosmoshub/get-nodes';
import getProposals from '@/server/tools/chains/cosmoshub/get-proposals';
import getStakingParams from '@/server/tools/chains/cosmoshub/get-staking-params';
import getTvs from '@/server/tools/chains/cosmoshub/get-tvs';

const chainMethods: ChainMethods = {
  getNodes,
  getApr,
  getTvs,
  getStakingParams,
  getProposals,
};

export default chainMethods;
