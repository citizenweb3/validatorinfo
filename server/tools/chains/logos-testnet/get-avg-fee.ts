import { GetAvgFee } from '@/server/tools/chains/chain-indexer';

// Logos testnet: gas prices are always 0 → avgFee is meaningless.
const getAvgFee: GetAvgFee = async () => null;

export default getAvgFee;
