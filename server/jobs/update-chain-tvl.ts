import db from '@/db';
import logger from '@/logger';
import getChainMethods from '@/server/tools/chains/methods';
import { getChainParams } from '@/server/tools/chains/params';

const { logInfo, logError } = logger('get-tvl');

export const updateChainTvl = async (chainNames: string[]) => {
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
      const tvl = await chainMethods.getTvl(chainParams);

      if (tvl) {
        await db.chain.update({
          where: { id: dbChain.id },
          data: {
            ...tvl,
          },
        });
      } else {
        logError(`Can't fetch TVL for ${chainParams.name}`);
      }
    } catch (e) {
      logError("Can't fetch TVL's: ", e);
    }
  }
};

export default updateChainTvl;
