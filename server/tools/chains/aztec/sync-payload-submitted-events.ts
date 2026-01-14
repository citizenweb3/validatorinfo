import { Abi, getAddress } from 'viem';

import { eventsClient } from '@/db';
import logger from '@/logger';
import {
  contracts,
  deploymentBlocks,
  governanceProposerAbis,
} from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { fetchBlockTimestamps } from '@/server/tools/chains/aztec/utils/fetch-block-timestamps';
import { fetchEventsWithAdaptiveRetry } from '@/server/tools/chains/aztec/utils/fetch-events-with-retry';
import { getChunkSizeForRpcUrls } from '@/server/tools/chains/aztec/utils/get-chunck-size-rpc';
import { createViemClientWithFailover } from '@/server/utils/viem-client-with-failover';
import { SyncResult } from '@/server/tools/chains/aztec/types';

const { logInfo, logError, logWarn } = logger('sync-payload-submitted-events');

export const syncPayloadSubmittedEvents = async (
  chainName: 'aztec' | 'aztec-testnet',
  dbChain: { id: number },
  l1RpcUrls: string[],
): Promise<SyncResult> => {
  let totalEvents = 0;
  let newEvents = 0;
  let skippedEvents = 0;
  const failedRanges: Array<{ start: string; end: string }> = [];

  try {
    const contractAddress = contracts[chainName].governanceProposerAddress;
    const abi = governanceProposerAbis[chainName] as Abi;
    const deploymentBlock = BigInt(deploymentBlocks[chainName]);
    const chunkSize = getChunkSizeForRpcUrls(l1RpcUrls);

    const client = createViemClientWithFailover(l1RpcUrls, {
      loggerName: `${chainName}-payload-submitted-events-sync`,
    });

    let lastEvent;
    try {
      lastEvent = await eventsClient.aztecPayloadSubmittedEvent.findFirst({
        where: { chainId: dbChain.id },
        orderBy: { blockNumber: 'desc' },
      });
    } catch (error: any) {
      logError(`${chainName}: Events DB unavailable for payload submitted events - ${error.message}`);
      logWarn(`${chainName}: Starting payload submitted events sync from deployment block`);
      lastEvent = null;
    }

    const startBlock = lastEvent ? BigInt(lastEvent.blockNumber) + BigInt(1) : deploymentBlock;
    const currentBlock = await client.getBlockNumber();

    if (startBlock > currentBlock) {
      logInfo(
        `${chainName}: Payload submitted events already up to date (last: ${startBlock}, current: ${currentBlock})`,
      );
      return { success: true, totalEvents: 0, newEvents: 0, skippedEvents: 0 };
    }

    logInfo(
      `${chainName}: Syncing payload submitted events from block ${startBlock} to ${currentBlock} (${currentBlock - startBlock} blocks)`,
    );

    const { events: allEvents, failedRanges: fetchFailedRanges } = await fetchEventsWithAdaptiveRetry({
      client,
      contractAddress: contractAddress as `0x${string}`,
      abi,
      eventName: 'PayloadSubmitted',
      fromBlock: startBlock,
      toBlock: currentBlock,
      initialChunkSize: chunkSize,
      chainName,
    });

    failedRanges.push(...fetchFailedRanges);

    if (allEvents.length === 0) {
      logInfo(`${chainName}: No new payload submitted events found`);
      const result: SyncResult = { success: true, totalEvents: 0, newEvents: 0, skippedEvents: 0 };
      if (failedRanges.length > 0) {
        result.failedRanges = failedRanges;
        logWarn(`${chainName}: ${failedRanges.length} block ranges failed to sync`);
      }
      return result;
    }

    logInfo(`${chainName}: Found ${allEvents.length} payload submitted events`);

    const blockNumbers = allEvents.map((e) => e.blockNumber!);
    const blockTimestamps = await fetchBlockTimestamps(client, blockNumbers);

    for (const event of allEvents) {
      try {
        const args = event.args as {
          payload: `0x${string}`;
          round: bigint;
        };

        const blockKey = event.blockNumber!.toString();
        const timestamp = blockTimestamps.get(blockKey);

        if (!timestamp) {
          logError(`${chainName}: Missing timestamp for block ${blockKey}, skipping event`);
          skippedEvents++;
          totalEvents++;
          continue;
        }

        try {
          await eventsClient.aztecPayloadSubmittedEvent.create({
            data: {
              chainId: dbChain.id,
              blockNumber: event.blockNumber!.toString(),
              transactionHash: event.transactionHash!,
              logIndex: Number(event.logIndex!),
              payload: getAddress(args.payload),
              round: args.round.toString(),
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
              `${chainName}: Failed to save payload submitted event at block ${event.blockNumber}: ${dbError.message}`,
            );
          }
        }
      } catch (e: any) {
        logError(
          `${chainName}: Failed to process payload submitted event at block ${event.blockNumber}: ${e.message}`,
        );
      }
    }

    logInfo(
      `${chainName}: Payload submitted events sync complete - ${totalEvents} total (${newEvents} new, ${skippedEvents} duplicates)`,
    );

    const result: SyncResult = { success: true, totalEvents, newEvents, skippedEvents };
    if (failedRanges.length > 0) {
      result.failedRanges = failedRanges;
      logWarn(`${chainName}: ${failedRanges.length} block ranges failed to sync`);
    }
    return result;
  } catch (e: any) {
    logError(`${chainName}: Fatal error syncing payload submitted events: ${e.message}`);
    return { success: false, totalEvents, newEvents, skippedEvents, failedRanges, error: e.message };
  }
};
