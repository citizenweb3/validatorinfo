import { Abi, getAddress } from 'viem';

import { eventsClient } from '@/db';
import logger from '@/logger';
import {
  contracts,
  deploymentBlocks,
  stakingRegistryAbis,
} from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { fetchBlockTimestamps } from '@/server/tools/chains/aztec/utils/fetch-block-timestamps';
import { getChunkSizeForRpcUrls } from '@/server/tools/chains/aztec/utils/get-chunck-size-rpc';
import { createViemClientWithFailover } from '@/server/utils/viem-client-with-failover';
import { SyncResult } from '@/server/tools/chains/aztec/types';

const { logInfo, logError, logWarn } = logger('sync-attester-events');

/**
 * Sync AttestersAddedToProvider events from StakingRegistry contract.
 *
 * This function queries ALL events in a single pass (without filtering by provider),
 * which is much faster than iterating over each provider separately.
 */
export const syncAttesterEvents = async (
  chainName: 'aztec' | 'aztec-testnet',
  dbChain: { id: number },
  l1RpcUrls: string[],
): Promise<SyncResult> => {
  let totalEvents = 0;
  let newEvents = 0;
  let skippedEvents = 0;
  const failedRanges: Array<{ start: string; end: string }> = [];

  try {
    const contractAddress = contracts[chainName].stakingRegistryAddress;
    const abi = stakingRegistryAbis[chainName] as Abi;
    const deploymentBlock = BigInt(deploymentBlocks[chainName]);
    const chunkSize = getChunkSizeForRpcUrls(l1RpcUrls);

    const client = createViemClientWithFailover(l1RpcUrls, {
      loggerName: `${chainName}-attester-events-sync`,
    });

    let lastEvent;
    try {
      lastEvent = await eventsClient.aztecAttesterEvent.findFirst({
        where: { chainId: dbChain.id },
        orderBy: { blockNumber: 'desc' },
      });
    } catch (error: any) {
      logError(`${chainName}: Events DB unavailable for attester events - ${error.message}`);
      logWarn(`${chainName}: Starting attester events sync from deployment block`);
      lastEvent = null;
    }

    const startBlock = lastEvent ? BigInt(lastEvent.blockNumber) + BigInt(1) : deploymentBlock;
    const currentBlock = await client.getBlockNumber();

    if (startBlock > currentBlock) {
      logInfo(`${chainName}: Attester events already up to date (last: ${startBlock}, current: ${currentBlock})`);
      return { success: true, totalEvents: 0, newEvents: 0, skippedEvents: 0 };
    }

    logInfo(
      `${chainName}: Syncing attester events from block ${startBlock} to ${currentBlock} (${currentBlock - startBlock} blocks)`,
    );

    // Process events per chunk to avoid memory accumulation
    for (let blockStart = startBlock; blockStart < currentBlock; blockStart += BigInt(chunkSize)) {
      const blockEnd =
        blockStart + BigInt(chunkSize) > currentBlock ? currentBlock : blockStart + BigInt(chunkSize);

      let chunkEvents;
      try {
        chunkEvents = await client.getContractEvents({
          address: contractAddress as `0x${string}`,
          abi: abi,
          eventName: 'AttestersAddedToProvider',
          fromBlock: blockStart,
          toBlock: blockEnd,
        });
      } catch (e: any) {
        logError(
          `${chainName}: Failed to fetch attester events, blocks ${blockStart}-${blockEnd}: ${e.message}`,
        );
        failedRanges.push({ start: blockStart.toString(), end: blockEnd.toString() });
        continue;
      }

      if (chunkEvents.length === 0) {
        continue;
      }

      // Fetch timestamps for this chunk's events
      const blockNumbers = chunkEvents
        .map((e) => e.blockNumber)
        .filter((bn): bn is bigint => bn !== null && bn !== undefined);
      const blockTimestamps = await fetchBlockTimestamps(client, blockNumbers);

      // Process and save events from this chunk immediately
      for (const event of chunkEvents) {
        if (!event.blockNumber || !event.transactionHash || event.logIndex === undefined) {
          logWarn(`${chainName}: Skipping event with missing required fields`);
          skippedEvents++;
          totalEvents++;
          continue;
        }

        try {
          const args = event.args as { providerIdentifier: bigint; attesters: string[] };
          const blockKey = event.blockNumber.toString();
          const timestamp = blockTimestamps.get(blockKey);

          if (!timestamp) {
            logError(`${chainName}: Missing timestamp for block ${blockKey}, skipping event`);
            skippedEvents++;
            totalEvents++;
            continue;
          }

          const providerId = args.providerIdentifier.toString();
          const attesters = args.attesters.map((a) => getAddress(a));

          try {
            await eventsClient.aztecAttesterEvent.create({
              data: {
                chainId: dbChain.id,
                blockNumber: event.blockNumber.toString(),
                transactionHash: event.transactionHash,
                logIndex: Number(event.logIndex),
                providerId,
                providerAddress: null,
                attesters,
                timestamp,
              },
            });

            newEvents++;
            totalEvents++;
          } catch (dbError: any) {
            if (dbError.code === 'P2002') {
              skippedEvents++;
              totalEvents++;
            } else {
              logError(
                `${chainName}: Failed to save attester event at block ${event.blockNumber}: ${dbError.message}`,
              );
            }
          }
        } catch (e: any) {
          logError(`${chainName}: Failed to process attester event at block ${event.blockNumber}: ${e.message}`);
        }
      }
    }

    if (totalEvents === 0) {
      logInfo(`${chainName}: No new attester events found`);
    } else {
      logInfo(
        `${chainName}: Attester events sync complete - ${totalEvents} total (${newEvents} new, ${skippedEvents} duplicates)`,
      );
    }

    const result: SyncResult = { success: true, totalEvents, newEvents, skippedEvents };
    if (failedRanges.length > 0) {
      result.failedRanges = failedRanges;
      logWarn(`${chainName}: ${failedRanges.length} block ranges failed to sync`);
    }
    return result;
  } catch (e: any) {
    logError(`${chainName}: Fatal error syncing attester events: ${e.message}`);
    return { success: false, totalEvents, newEvents, skippedEvents, failedRanges, error: e.message };
  }
};
