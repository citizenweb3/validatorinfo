import db from '@/db';
import logger from '@/logger';
import { syncAttesterEvents } from '@/server/tools/chains/aztec/sync-attester-events';
import { syncSlashingEvents } from '@/server/tools/chains/aztec/sync-slashing-events';
import { syncStakedEvents } from '@/server/tools/chains/aztec/sync-staked-events';
import { syncVoteEvents } from '@/server/tools/chains/aztec/sync-vote-events';
import { getL1 } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { getChainParams } from '@/server/tools/chains/params';

const { logInfo, logError } = logger('sync-aztec-events');

const AZTEC_CHAINS = ['aztec', 'aztec-testnet'] as const;

const syncAztecEvents = async () => {
  logInfo('Starting Aztec events sync (attester + staked + slashing + vote)');

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

      logInfo(`${chainName}: Syncing all event types in parallel`);

      const results = await Promise.allSettled([
        syncAttesterEvents(chainName, dbChain, l1RpcUrls),
        syncStakedEvents(chainName, dbChain, l1RpcUrls),
        syncSlashingEvents(chainName, dbChain, l1RpcUrls),
        syncVoteEvents(chainName, dbChain, l1RpcUrls),
      ]);

      const eventTypes = ['Attester', 'Staked', 'Slashing', 'Vote'];

      results.forEach((result, index) => {
        const eventType = eventTypes[index];

        if (result.status === 'fulfilled') {
          const syncResult = result.value;
          if (syncResult.success) {
            logInfo(
              `${chainName}: ✓ ${eventType} events - ${syncResult.totalEvents} total (${syncResult.newEvents} new, ${syncResult.skippedEvents} duplicates)`,
            );
          } else {
            logError(`${chainName}: ✗ ${eventType} events failed - ${syncResult.error}`);
          }
        } else {
          logError(`${chainName}: ✗ ${eventType} events crashed - ${result.reason?.message || result.reason}`);
        }
      });

      logInfo(`${chainName}: Sync complete`);
    } catch (e: any) {
      logError(`Error processing ${chainName}: ${e.message}`);
    }
  }

  logInfo('Aztec events sync completed');
};

export default syncAztecEvents;
