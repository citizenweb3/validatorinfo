import { Abi, getAddress } from 'viem';

import { eventsClient } from '@/db';
import logger from '@/logger';
import {
  contracts,
  deploymentBlocks,
  rollupAbis,
} from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { getChunkSizeForRpcUrls } from '@/server/tools/chains/aztec/utils/get-chunck-size-rpc';
import { createViemClientWithFailover } from '@/server/utils/viem-client-with-failover';

const { logInfo, logError, logWarn } = logger('sync-slashing-events');

export interface SyncResult {
  success: boolean;
  totalEvents: number;
  newEvents: number;
  skippedEvents: number;
  error?: string;
}

export const syncSlashingEvents = async (
  chainName: 'aztec' | 'aztec-testnet',
  dbChain: { id: number },
  l1RpcUrls: string[],
): Promise<SyncResult> => {
  let totalEvents = 0;
  let newEvents = 0;
  let skippedEvents = 0;

  try {
    const contractAddress = contracts[chainName].rollupAddress;
    const abi = rollupAbis[chainName] as Abi;
    const deploymentBlock = BigInt(deploymentBlocks[chainName]);
    const chunkSize = getChunkSizeForRpcUrls(l1RpcUrls);

    const client = createViemClientWithFailover(l1RpcUrls, {
      loggerName: `${chainName}-slashing-events-sync`,
    });

    let lastEvent;
    try {
      lastEvent = await eventsClient.aztecSlashedEvent.findFirst({
        where: { chainId: dbChain.id },
        orderBy: { blockNumber: 'desc' },
      });
    } catch (error: any) {
      logError(`${chainName}: Events DB unavailable for slashing events - ${error.message}`);
      logWarn(`${chainName}: Starting slashing events sync from deployment block`);
      lastEvent = null;
    }

    const startBlock = lastEvent ? BigInt(lastEvent.blockNumber) + BigInt(1) : deploymentBlock;
    const currentBlock = await client.getBlockNumber();

    if (startBlock > currentBlock) {
      logInfo(
        `${chainName}: Slashing events already up to date (last: ${startBlock}, current: ${currentBlock})`,
      );
      return { success: true, totalEvents: 0, newEvents: 0, skippedEvents: 0 };
    }

    logInfo(
      `${chainName}: Syncing slashing events from block ${startBlock} to ${currentBlock} (${currentBlock - startBlock} blocks)`,
    );

    const allEvents = [];
    for (let blockStart = startBlock; blockStart < currentBlock; blockStart += BigInt(chunkSize)) {
      const blockEnd =
        blockStart + BigInt(chunkSize) > currentBlock ? currentBlock : blockStart + BigInt(chunkSize);

      try {
        const chunkEvents = await client.getContractEvents({
          address: contractAddress as `0x${string}`,
          abi: abi,
          eventName: 'Slashed',
          fromBlock: blockStart,
          toBlock: blockEnd,
        });

        allEvents.push(...chunkEvents);
      } catch (e: any) {
        logError(
          `${chainName}: Failed to fetch slashing events, blocks ${blockStart}-${blockEnd}: ${e.message}`,
        );
      }
    }

    if (allEvents.length === 0) {
      logInfo(`${chainName}: No new slashing events found`);
      return { success: true, totalEvents: 0, newEvents: 0, skippedEvents: 0 };
    }

    logInfo(`${chainName}: Found ${allEvents.length} slashing events`);

    for (const event of allEvents) {
      try {
        const args = event.args as {
          attester: `0x${string}`;
          amount: bigint;
        };
        const block = await client.getBlock({ blockNumber: event.blockNumber! });

        try {
          await eventsClient.aztecSlashedEvent.create({
            data: {
              chainId: dbChain.id,
              blockNumber: event.blockNumber!.toString(),
              transactionHash: event.transactionHash!,
              logIndex: Number(event.logIndex!),
              attester: getAddress(args.attester),
              amount: args.amount.toString(),
              timestamp: new Date(Number(block.timestamp) * 1000),
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
              `${chainName}: Failed to save slashing event at block ${event.blockNumber}: ${dbError.message}`,
            );
          }
        }
      } catch (e: any) {
        logError(`${chainName}: Failed to process slashing event at block ${event.blockNumber}: ${e.message}`);
      }
    }

    logInfo(
      `${chainName}: Slashing events sync complete - ${totalEvents} total (${newEvents} new, ${skippedEvents} duplicates)`,
    );

    return { success: true, totalEvents, newEvents, skippedEvents };
  } catch (e: any) {
    logError(`${chainName}: Fatal error syncing slashing events: ${e.message}`);
    return { success: false, totalEvents, newEvents, skippedEvents, error: e.message };
  }
};
