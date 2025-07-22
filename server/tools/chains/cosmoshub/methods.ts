import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import getActiveSetMinAmount from '@/server/tools/chains/cosmoshub/get-active-set-min-amount';
import getApr from '@/server/tools/chains/cosmoshub/get-apr';
import getCommPool from '@/server/tools/chains/cosmoshub/get-community-pool';
import getCommTax from '@/server/tools/chains/cosmoshub/get-community-tax';
import getMissedBlocks from '@/server/tools/chains/cosmoshub/get-missed-blocks';
import getNodeParams from '@/server/tools/chains/cosmoshub/get-node-params';
import getNodes from '@/server/tools/chains/cosmoshub/get-nodes';
import getProposalParams from '@/server/tools/chains/cosmoshub/get-proposal-params';
import getProposals from '@/server/tools/chains/cosmoshub/get-proposals';
import getSlashingParams from '@/server/tools/chains/cosmoshub/get-slashing-params';
import getStakingParams from '@/server/tools/chains/cosmoshub/get-staking-params';
import getTvs from '@/server/tools/chains/cosmoshub/get-tvs';
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
  getProposalParams,
  getCommPool,
  getActiveSetMinAmount,
};

export default chainMethods;
