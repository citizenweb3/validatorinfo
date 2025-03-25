import db from '@/db';
import logger from '@/logger';
import { getChainParams } from '@/server/tools/chains/params';

const { logError, logInfo } = logger('get-uptime');

export const getChainUptime = async (chainNames: string[]) => {
  for (const chainName of chainNames) {
    const chainParams = getChainParams(chainName);

    try {
      const dbChain = await db.chain.findFirst({
        where: { chainId: chainParams.chainId },
      });
      if (!dbChain) {
        logError(`Chain ${chainParams.chainId} not found in database`);
        return;
      }

      const currentTime = Date.now();
      const rpcEndpoint = chainParams.nodes.find((node) => node.type === 'rpc')?.url;
      if (!rpcEndpoint) {
        logError(`RPC node for ${chainName} chain not found`);
        return;
      }

      const response = await fetch(`${rpcEndpoint}/status`);
      if (!response.ok) {
        throw new Error(`Ошибка запроса: ${response.status}`);
      }
      const data = await response.json();
      const blockHeight = +data.result.sync_info.latest_block_height;

      const txCount = blockHeight - dbChain.uptimeHeight;
      const avgTxInterval = txCount ? (currentTime - +dbChain.lastUptimeUpdated) / txCount : 0;

      if (!avgTxInterval) {
        logError(`${chainName} - avgTxInterval is 0`, {
          uptimeHeight: dbChain.uptimeHeight,
          lastUptimeUpdated: dbChain.lastUptimeUpdated,
          txCount,
          currentTime,
          blockHeight,
        });
      }

      await db.chain.update({
        where: { id: dbChain.id },
        data: {
          lastUptimeUpdated: new Date(currentTime),
          uptimeHeight: blockHeight,
          avgTxInterval,
        },
      });
      logInfo(`${chainName} - uptime updated`);
    } catch (e) {
      logError(`${chainName} - can't fetch Uptime`, e);
    }
  }
};

export default getChainUptime;
