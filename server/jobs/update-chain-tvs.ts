import db from '@/db';
import logger from '@/logger';
import getChainMethods from '@/server/tools/chains/methods';
import { getChainParams } from '@/server/tools/chains/params';

const { logInfo, logError } = logger('get-tvls');

export const updateChainTvs = async (chainNames: string[]) => {
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
      const tvs = await chainMethods.getTvs(chainParams);

      if (tvs) {
        await db.tokenomics.upsert({
          where: { chainId: dbChain.id },
          update: { ...tvs },
          create: { chainId: dbChain.id, ...tvs },
        });

      } else {
        logError(`Can't fetch TVS for ${chainParams.name}`);
      }
    } catch (e) {
      logError(`'Can't fetch TVS: ', ${e}`);
    }
  }
};

export default updateChainTvs;
