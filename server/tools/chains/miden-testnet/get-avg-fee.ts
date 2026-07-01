import { GetAvgFee } from '@/server/tools/chains/chain-indexer';

// Miden testnet: tx-level fee is not exposed in the indexer schema. The only
// fee-related field is block-level `verification_base_fee`; there is no
// per-tx `fee_amount`. Return null until the indexer surfaces per-tx fees.
const getAvgFee: GetAvgFee = async () => null;

export default getAvgFee;
