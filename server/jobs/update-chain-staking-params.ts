import db from '@/db';
import logger from '@/logger';
import getChainMethods from '@/server/tools/chains/methods';
import { getChainParams } from '@/server/tools/chains/params';

const { logError, logInfo } = logger('get-staking-params');

const updateChainStakingParams = async (chainNames: string[]) => {
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
      if (dbChain.hasValidators) {
        logInfo(`${chainName} updating`);
        const params = await chainMethods.getStakingParams(chainParams);
        logInfo(`${chainName} Staking params: ${JSON.stringify(params)}`);

        await db.chain.update({
          where: { id: dbChain.id },
          data: {
            ...params,
          },
        });
      } else {
        logInfo(`${chainName} has no validators`);
      }
    } catch (e) {
      logError("Can't fetch staking params: ", e);
    }
  }
};

export default updateChainStakingParams;
