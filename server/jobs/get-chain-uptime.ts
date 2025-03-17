import db from '@/db';
import logger from '@/logger';

import { ChainWithNodes } from '../types';

const { logError, logInfo } = logger('get-chain-uptime');

export const getChainUptime = async (chains: ChainWithNodes[]) => {
  for (const chain of chains) {
    try {
      const currentTime = Date.now();
      const rpcEndpoint = chain.chainNodes.find((node) => node.type === 'rpc')?.url;
      if (!rpcEndpoint) {
        logError(`RPC node for ${chain.name} chain not found`);
        return;
      }

      const response = await fetch(`${rpcEndpoint}/status`);
      if (!response.ok) {
        throw new Error(`Ошибка запроса: ${response.status}`);
      }
      const data = await response.json();
      const blockHeight = +data.result.sync_info.latest_block_height;

      const txCount = blockHeight - chain.uptimeHeight;
      const avgTxInterval = txCount ? (currentTime - +chain.lastUptimeUpdated) / txCount : 0;

      if (!avgTxInterval) {
        console.log(
          '[SSA] ',
          `server/jobs/get-chain-uptime.ts:29 chain.lastUptimeUpdated, txCount, currentTime, blockHeight:`,
          chain.uptimeHeight,
          chain.lastUptimeUpdated,
          txCount,
          currentTime,
          blockHeight,
        );
        logError(`${chain.name} - avgTxInterval is 0`);
      }

      await db.chain.update({
        where: { id: chain.id },
        data: {
          lastUptimeUpdated: new Date(currentTime),
          uptimeHeight: blockHeight,
          avgTxInterval,
        },
      });
      logInfo(`${chain.name} - uptime updated`);
    } catch (e) {
      logError(`${chain.name} - can't fetch Uptime`, e);
    }
  }
};

export default getChainUptime;
