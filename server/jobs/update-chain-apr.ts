import db from '@/db';
import logger from '@/logger';
import getChainMethods from '@/server/tools/chains/methods';
import { getChainParams } from '@/server/tools/chains/params';

const { logError, logInfo } = logger('get-apr');

const updateChainApr = async (chainNames: string[]) => {
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
      const apr = (await chainMethods.getApr(chainParams)) || 0;
      logInfo(`${chainName} APR: ${apr}`);

      await db.tokenomics.upsert({
        where: { chainId: dbChain.id },
        update: { apr },
        create: { chainId: dbChain.id, apr },
      });

    } catch (e) {
      logError(`Can't fetch apr: ', ${e}`);
    }
  }
};

export default updateChainApr;
