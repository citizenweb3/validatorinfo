import getAvgFee from '@/server/tools/chains/atomone/get-avg-fee';
import getProposalParams from '@/server/tools/chains/atomone/get-proposal-params';
import getProposals from '@/server/tools/chains/atomone/get-proposals';
import getTotalTxs from '@/server/tools/chains/atomone/get-total-txs';
import getTps from '@/server/tools/chains/atomone/get-tps';
import getTxsLast24h from '@/server/tools/chains/atomone/get-txs-last-24h';
import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import cosmosChainMethods from '@/server/tools/chains/cosmoshub/methods';

const chainMethods: ChainMethods = {
  ...cosmosChainMethods,
  getProposals,
  getProposalParams,
  getTotalTxs,
  getTxsLast24h,
  getTps,
  getAvgFee,
};

export default chainMethods;
