import db from '@/db';
import logger from '@/logger';
import getChainMethods from '@/server/tools/chains/methods';
import { getChainParams } from '@/server/tools/chains/params';

const { logError, logInfo } = logger('get-uptime');

export const getChainUptime = async (chainNames: string[]) => {
  for (const chainName of chainNames) {
    const chainParams = getChainParams(chainName);
    const chainMethods = await getChainMethods(chainName);

    try {
      const dbChain = await db.chain.findFirst({
        where: { chainId: chainParams.chainId },
      });
      if (!dbChain) {
        logError(`Chain ${chainParams.chainId} not found in database`);
        return;
      }

      const uptime = await chainMethods.getChainUptime(dbChain);

      if (uptime) {
        await db.chain.update({
          where: { id: dbChain.id },
          data: {
            lastUptimeUpdated: uptime.lastUptimeUpdated,
            uptimeHeight: uptime.uptimeHeight,
            avgTxInterval: uptime.avgTxInterval,
          },
        });
      }

      logInfo(`${chainName} - uptime updated`);
    } catch (e) {
      logError(`${chainName} - can't fetch Uptime`, e);
    }
  }
};

export default getChainUptime;
