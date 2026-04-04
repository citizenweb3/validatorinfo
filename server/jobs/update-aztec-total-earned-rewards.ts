import db from '@/db';
import logger from '@/logger';
import { getTotalEarnedRewards } from '@/server/tools/chains/aztec/get-total-earned-rewards';

const { logInfo, logError, logWarn } = logger('update-aztec-total-earned-rewards');

const AZTEC_CHAINS = ['aztec', 'aztec-testnet'] as const;

const updateAztecTotalEarnedRewards = async () => {
  logInfo('Starting Aztec total earned rewards update');

  for (const chainName of AZTEC_CHAINS) {
    try {
      const dbChain = await db.chain.findFirst({ where: { name: chainName } });

      if (!dbChain) {
        logWarn(`Chain ${chainName} not found`);
        continue;
      }

      await getTotalEarnedRewards(chainName, dbChain);
      logInfo(`${chainName}: Total earned rewards update completed`);
    } catch (e: any) {
      logError(`Error processing ${chainName}: ${e.message}`);
    }
  }

  logInfo('Aztec total earned rewards update completed');
};

export default updateAztecTotalEarnedRewards;
