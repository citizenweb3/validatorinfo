import db from '@/db';
import logger from '@/logger';
import getChainMethods from '@/server/tools/chains/methods';
import { getChainParams } from '@/server/tools/chains/params';

const { logError, logInfo } = logger('get-wallets-amount');

const updateWalletsAmount = async (chainNames: string[]) => {
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
      const walletsAmount = (await chainMethods.getWalletsAmount(chainParams));
      logInfo(`${chainName} wallets amount: ${walletsAmount}`);

      if (walletsAmount !== undefined && walletsAmount !== null) {
        await db.chain.update({
          where: { id: dbChain.id },
          data: {
            walletsAmount,
          },
        });
      }
    } catch (e) {
      logError("Can't fetch community tax: ", e);
    }
  }
};

export default updateWalletsAmount;
