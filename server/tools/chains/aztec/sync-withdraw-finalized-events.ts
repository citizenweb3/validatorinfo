import { Abi, getAddress, isAddress } from 'viem';

import { eventsClient } from '@/db';
import logger from '@/logger';
import { contracts, deploymentBlocks, rollupAbis } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { fetchBlockTimestamps } from '@/server/tools/chains/aztec/utils/fetch-block-timestamps';
import { getChunkSizeForRpcUrls } from '@/server/tools/chains/aztec/utils/get-chunck-size-rpc';
import { createViemClientWithFailover } from '@/server/utils/viem-client-with-failover';
import { SyncResult } from '@/server/tools/chains/aztec/types';

const { logInfo, logError, logWarn } = logger('sync-withdraw-finalized-events');

export const syncWithdrawFinalizedEvents = async (
  chainName: 'aztec' | 'aztec-testnet',
  dbChain: { id: number },
  l1RpcUrls: string[],
): Promise<SyncResult> => {
  let totalEvents = 0;
  let newEvents = 0;
  let skippedEvents = 0;
  const failedRanges: Array<{ start: string; end: string }> = [];

  try {
    const contractAddress = contracts[chainName].rollupAddress;
    const abi = rollupAbis[chainName] as Abi;
    const deploymentBlock = BigInt(deploymentBlocks[chainName]);
    const chunkSize = getChunkSizeForRpcUrls(l1RpcUrls);

    const client = createViemClientWithFailover(l1RpcUrls, {
      loggerName: `${chainName}-withdraw-finalized-events-sync`,
    });

    let lastEvent;
    try {
      lastEvent = await eventsClient.aztecWithdrawFinalizedEvent.findFirst({
        where: { chainId: dbChain.id },
        orderBy: { blockNumber: 'desc' },
      });
    } catch (error: any) {
      logError(`${chainName}: Events DB unavailable for withdraw finalized events - ${error.message}`);
      logWarn(`${chainName}: Starting withdraw finalized events sync from deployment block`);
      lastEvent = null;
    }

    const startBlock = lastEvent ? BigInt(lastEvent.blockNumber) + BigInt(1) : deploymentBlock;
    const currentBlock = await client.getBlockNumber();

    if (startBlock > currentBlock) {
      logInfo(
        `${chainName}: Withdraw finalized events already up to date (last: ${startBlock}, current: ${currentBlock})`,
      );
      return { success: true, totalEvents: 0, newEvents: 0, skippedEvents: 0 };
    }

    logInfo(
      `${chainName}: Syncing withdraw finalized events from block ${startBlock} to ${currentBlock} (${currentBlock - startBlock} blocks)`,
    );

    const allEvents = [];
    for (let blockStart = startBlock; blockStart < currentBlock; blockStart += BigInt(chunkSize)) {
      const blockEnd =
        blockStart + BigInt(chunkSize) > currentBlock ? currentBlock : blockStart + BigInt(chunkSize);

      try {
        const chunkEvents = await client.getContractEvents({
          address: contractAddress as `0x${string}`,
          abi: abi,
          eventName: 'WithdrawFinalized',
          fromBlock: blockStart,
          toBlock: blockEnd,
        });

        allEvents.push(...chunkEvents);
      } catch (e: any) {
        logError(
          `${chainName}: Failed to fetch withdraw finalized events, blocks ${blockStart}-${blockEnd}: ${e.message}`,
        );
        failedRanges.push({ start: blockStart.toString(), end: blockEnd.toString() });
      }
    }

    if (allEvents.length === 0) {
      logInfo(`${chainName}: No new withdraw finalized events found`);
      const result: SyncResult = { success: true, totalEvents: 0, newEvents: 0, skippedEvents: 0 };
      if (failedRanges.length > 0) {
        result.failedRanges = failedRanges;
        logWarn(`${chainName}: ${failedRanges.length} block ranges failed to sync`);
      }
      return result;
    }

    logInfo(`${chainName}: Found ${allEvents.length} withdraw finalized events`);

    const blockNumbers = allEvents.map((e) => e.blockNumber!);
    const blockTimestamps = await fetchBlockTimestamps(client, blockNumbers);

    for (const event of allEvents) {
      try {
        const args = event.args as {
          attester: `0x${string}`;
          recipient: `0x${string}`;
          amount: bigint;
        };

        const blockKey = event.blockNumber!.toString();
        const timestamp = blockTimestamps.get(blockKey);

        if (!timestamp) {
          logError(`${chainName}: Missing timestamp for block ${blockKey}, skipping event`);
          skippedEvents++;
          totalEvents++;
          continue;
        }

        if (!isAddress(args.attester)) {
          logError(`${chainName}: Invalid attester address ${args.attester} at block ${blockKey}, skipping event`);
          skippedEvents++;
          totalEvents++;
          continue;
        }

        if (!isAddress(args.recipient)) {
          logError(`${chainName}: Invalid recipient address ${args.recipient} at block ${blockKey}, skipping event`);
          skippedEvents++;
          totalEvents++;
          continue;
        }

        const checksummedAttester = getAddress(args.attester);
        const checksummedRecipient = getAddress(args.recipient);

        try {
          await eventsClient.aztecWithdrawFinalizedEvent.create({
            data: {
              chainId: dbChain.id,
              blockNumber: event.blockNumber!.toString(),
              transactionHash: event.transactionHash!,
              logIndex: Number(event.logIndex!),
              attester: checksummedAttester,
              recipient: checksummedRecipient,
              amount: args.amount.toString(),
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
              `${chainName}: Failed to save withdraw finalized event at block ${event.blockNumber}: ${dbError.message}`,
            );
          }
        }
      } catch (e: any) {
        logError(`${chainName}: Failed to process withdraw finalized event at block ${event.blockNumber}: ${e.message}`);
      }
    }

    logInfo(
      `${chainName}: Withdraw finalized events sync complete - ${totalEvents} total (${newEvents} new, ${skippedEvents} duplicates)`,
    );

    const result: SyncResult = { success: true, totalEvents, newEvents, skippedEvents };
    if (failedRanges.length > 0) {
      result.failedRanges = failedRanges;
      logWarn(`${chainName}: ${failedRanges.length} block ranges failed to sync`);
    }
    return result;
  } catch (e: any) {
    logError(`${chainName}: Fatal error syncing withdraw finalized events: ${e.message}`);
    return { success: false, totalEvents, newEvents, skippedEvents, failedRanges, error: e.message };
  }
};
