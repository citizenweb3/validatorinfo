import db from '@/db';
import logger from '@/logger';
import getChainMethods from '@/server/tools/chains/methods';
import { getChainParams } from '@/server/tools/chains/params';

const { logError, logInfo } = logger('update-active-set-min-amount');

const updateCommPool = async (chainNames: string[]) => {
  for (const chainName of chainNames) {
    const chainParams = getChainParams(chainName);
    const chainMethods = getChainMethods(chainName);

    try {
      const dbChain = await db.chain.findFirst({
        where: { chainId: chainParams.chainId },
      });
      if (!dbChain) {
        logError(`Chain ${chainParams.chainId} not found in database`);
        return null;
      }
      logInfo(`${chainName} updating`);
      const activeSetMinAmount = await chainMethods.getActiveSetMinAmount(chainParams);
      logInfo(`${chainName} active set min amount: ${activeSetMinAmount}`);

      if (activeSetMinAmount !== undefined && activeSetMinAmount !== null) {
        await db.tokenomics.upsert({
          where: { chainId: dbChain.id },
          update: { activeSetMinAmount },
          create: { chainId: dbChain.id, activeSetMinAmount },
        });
      }
    } catch (e) {
      logError("Can't fetch active set: ", e);
    }
  }
};

export default updateCommPool;
