import { GetTps } from '@/server/tools/chains/chain-indexer';
import { calculateAztecTps } from '@/server/jobs/utils/aztec-tx-metrics';

const getTps: GetTps = async () => calculateAztecTps();

export default getTps;
