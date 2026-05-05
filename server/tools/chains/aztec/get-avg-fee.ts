import { GetAvgFee } from '@/server/tools/chains/chain-indexer';
import { calculateAztecAverageFee } from '@/server/jobs/utils/aztec-tx-metrics';

const getAvgFee: GetAvgFee = async () => calculateAztecAverageFee();

export default getAvgFee;
