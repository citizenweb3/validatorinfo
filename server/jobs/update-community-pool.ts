import db from '@/db';
import logger from '@/logger';
import getChainMethods from '@/server/tools/chains/methods';
import { getChainParams } from '@/server/tools/chains/params';

const { logError, logInfo } = logger('get-community-pool');

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
      const communityPool = await chainMethods.getCommPool(chainParams);
      logInfo(`${chainName} community pool: ${communityPool}`);

      if (communityPool !== undefined && communityPool !== null) {
        await db.tokenomics.upsert({
          where: { chainId: dbChain.id },
          update: { communityPool },
          create: { chainId: dbChain.id, communityPool },
        });
      }
    } catch (e) {
      logError("Can't fetch community pool: ", e);
    }
  }
};

export default updateCommPool;
