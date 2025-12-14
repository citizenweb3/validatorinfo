import db from '@/db';
import logger from '@/logger';
import { syncAttesterEvents } from '@/server/tools/chains/aztec/sync-attester-events';
import { syncStakedEvents } from '@/server/tools/chains/aztec/sync-staked-events';
import { getL1 } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { getChainParams } from '@/server/tools/chains/params';

const { logInfo, logError } = logger('sync-aztec-events');

const AZTEC_CHAINS = ['aztec', 'aztec-testnet'] as const;

const syncAztecEvents = async () => {
  logInfo('Starting Aztec events sync (attester + staked)');

  for (const chainName of AZTEC_CHAINS) {
    try {
      const chainParams = getChainParams(chainName);

      const dbChain = await db.chain.findFirst({
        where: { chainId: chainParams.chainId },
      });

      if (!dbChain) {
        logError(`Chain ${chainName} not found in database`);
        continue;
      }

      const l1Chain = getChainParams(getL1[chainName]);
      const l1RpcUrls = l1Chain.nodes.filter((n: any) => n.type === 'rpc').map((n: any) => n.url);

      if (l1RpcUrls.length === 0) {
        logError(`No L1 RPC URLs found for ${chainName}, skipping`);
        continue;
      }

      logInfo(`${chainName}: Syncing both event types in parallel`);

      // Run both sync functions in parallel using allSettled
      const results = await Promise.allSettled([
        syncAttesterEvents(chainName, dbChain, l1RpcUrls),
        syncStakedEvents(chainName, dbChain, l1RpcUrls),
      ]);

      // Process attester events result
      if (results[0].status === 'fulfilled') {
        const attesterResult = results[0].value;
        if (attesterResult.success) {
          logInfo(
            `${chainName}: ✓ Attester events - ${attesterResult.totalEvents} total (${attesterResult.newEvents} new, ${attesterResult.skippedEvents} duplicates)`,
          );
        } else {
          logError(`${chainName}: ✗ Attester events failed - ${attesterResult.error}`);
        }
      } else {
        logError(`${chainName}: ✗ Attester events crashed - ${results[0].reason?.message || results[0].reason}`);
      }

      // Process staked events result
      if (results[1].status === 'fulfilled') {
        const stakedResult = results[1].value;
        if (stakedResult.success) {
          logInfo(
            `${chainName}: ✓ Staked events - ${stakedResult.totalEvents} total (${stakedResult.newEvents} new, ${stakedResult.skippedEvents} duplicates)`,
          );
        } else {
          logError(`${chainName}: ✗ Staked events failed - ${stakedResult.error}`);
        }
      } else {
        logError(`${chainName}: ✗ Staked events crashed - ${results[1].reason?.message || results[1].reason}`);
      }

      logInfo(`${chainName}: Sync complete`);
    } catch (e: any) {
      logError(`Error processing ${chainName}: ${e.message}`);
    }
  }

  logInfo('Aztec events sync completed');
};

export default syncAztecEvents;
