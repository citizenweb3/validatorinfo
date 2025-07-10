import db from '@/db';
import logger from '@/logger';
import getChainMethods from '@/server/tools/chains/methods';
import { getChainParams } from '@/server/tools/chains/params';

const { logError, logInfo } = logger('update-inflation-rate');

const updateInflationRate = async (chainNames: string[]) => {
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
      const inflation = await chainMethods.getInflationRate(chainParams);
      logInfo(`${chainName} inflation rate: ${inflation}`);

      if (inflation !== undefined && inflation !== null) {
        await db.tokenomics.upsert({
          where: { chainId: dbChain.id },
          update: { inflation },
          create: { chainId: dbChain.id, inflation },
        });
      }
    } catch (e) {
      logError("Can't fetch inflation rate: ", e);
    }
  }
};

export default updateInflationRate;
