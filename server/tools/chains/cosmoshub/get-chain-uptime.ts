import { Chain } from '@prisma/client';

import logger from '@/logger';
import fetchChainData from '@/server/tools/get-chain-data';

const { logError } = logger('get-uptime');

export const getChainUptime = async (dbChain: Chain) => {
  try {
    const currentTime = Date.now();
    const response = await fetchChainData<{ result: { sync_info: { latest_block_height: string } } }>(
      dbChain.name,
      'rpc',
      `/status`,
    );
    const blockHeight = parseInt(response.result.sync_info.latest_block_height);

    const txCount = blockHeight - dbChain.uptimeHeight;
    const avgTxInterval = txCount ? (currentTime - +dbChain.lastUptimeUpdated) / txCount : 0;

    if (!avgTxInterval) {
      logError(`${dbChain.name} - avgTxInterval is 0`, {
        uptimeHeight: dbChain.uptimeHeight,
        lastUptimeUpdated: dbChain.lastUptimeUpdated,
        txCount,
        currentTime,
        blockHeight,
      });
      return null;
    }

    return {
      lastUptimeUpdated: new Date(currentTime),
      uptimeHeight: blockHeight,
      avgTxInterval: avgTxInterval / 1000,
    };
  } catch (e) {
    logError(`${dbChain.name} - can't fetch Uptime`, e);
    return null;
  }
};

export default getChainUptime;
