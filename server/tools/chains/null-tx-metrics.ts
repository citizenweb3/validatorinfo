import {
  GetAvgFee,
  GetNodeAuthzGrants,
  GetTotalTxs,
  GetTps,
  GetTxsLast24h,
} from '@/server/tools/chains/chain-indexer';

const getTotalTxs: GetTotalTxs = async () => null;
const getTxsLast24h: GetTxsLast24h = async () => null;
const getTps: GetTps = async () => null;
const getAvgFee: GetAvgFee = async () => null;
const getNodeAuthzGrants: GetNodeAuthzGrants = async () => null;

const nullTxMetrics = {
  getTotalTxs,
  getTxsLast24h,
  getTps,
  getAvgFee,
  getNodeAuthzGrants,
};

export default nullTxMetrics;
