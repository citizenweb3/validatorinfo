import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import getApr from '@/server/tools/chains/cosmoshub/get-apr';
import getNodeParams from '@/server/tools/chains/cosmoshub/get-node-params';
import getNodes from '@/server/tools/chains/cosmoshub/get-nodes';
import getProposals from '@/server/tools/chains/cosmoshub/get-proposals';
import getStakingParams from '@/server/tools/chains/cosmoshub/get-staking-params';
import getTvs from '@/server/tools/chains/cosmoshub/get-tvs';
import getSlashingParams from '@/server/tools/chains/cosmoshub/get-slashing-params';
import getMissedBlocks from '@/server/tools/chains/cosmoshub/get-missed-blocks';
import getCommTax from '@/server/tools/chains/cosmoshub/get-community-tax';
import getWalletsAmount from '@/server/tools/chains/cosmoshub/get-wallets-amount';

const chainMethods: ChainMethods = {
  getNodes,
  getApr,
  getTvs,
  getStakingParams,
  getNodeParams,
  getProposals,
  getSlashingParams,
  getMissedBlocks,
  getNodesVotes: () => Promise.resolve([]),
  getCommTax,
  getWalletsAmount,
};

export default chainMethods;
