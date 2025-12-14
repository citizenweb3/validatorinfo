import { Abi, getAddress } from 'viem';

import { eventsClient } from '@/db';
import logger from '@/logger';
import {
  contracts,
  deploymentBlocks,
  stakingRegistryAbis,
} from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { getChunkSizeForRpcUrls } from '@/server/tools/chains/aztec/utils/get-chunck-size-rpc';
import { getProviders } from '@/server/tools/chains/aztec/utils/get-providers';
import { createViemClientWithFailover } from '@/server/utils/viem-client-with-failover';

const { logInfo, logError, logWarn } = logger('sync-staked-events');

export interface SyncResult {
  success: boolean;
  totalEvents: number;
  newEvents: number;
  skippedEvents: number;
  error?: string;
}

export const syncStakedEvents = async (
  chainName: 'aztec' | 'aztec-testnet',
  dbChain: { id: number },
  l1RpcUrls: string[],
): Promise<SyncResult> => {
  let totalEvents = 0;
  let newEvents = 0;
  let skippedEvents = 0;

  try {
    const contractAddress = contracts[chainName].stakingRegistryAddress;
    const abi = stakingRegistryAbis[chainName] as Abi;
    const deploymentBlock = BigInt(deploymentBlocks[chainName]);
    const chunkSize = getChunkSizeForRpcUrls(l1RpcUrls);

    const client = createViemClientWithFailover(l1RpcUrls, {
      loggerName: `${chainName}-staked-events-sync`,
    });

    let lastEvent;
    try {
      lastEvent = await eventsClient.aztecStakedEvent.findFirst({
        where: { chainId: dbChain.id },
        orderBy: { blockNumber: 'desc' },
      });
    } catch (error: any) {
      logError(`${chainName}: Events DB unavailable for staked events - ${error.message}`);
      logWarn(`${chainName}: Starting staked events sync from deployment block`);
      lastEvent = null;
    }

    const startBlock = lastEvent ? BigInt(lastEvent.blockNumber) + BigInt(1) : deploymentBlock;
    const currentBlock = await client.getBlockNumber();

    if (startBlock > currentBlock) {
      logInfo(`${chainName}: Staked events already up to date (last: ${startBlock}, current: ${currentBlock})`);
      return { success: true, totalEvents: 0, newEvents: 0, skippedEvents: 0 };
    }

    logInfo(
      `${chainName}: Syncing staked events from block ${startBlock} to ${currentBlock} (${currentBlock - startBlock} blocks)`,
    );

    const providers = await getProviders(l1RpcUrls, chainName);
    const providerIds = Array.from(providers.keys());

    logInfo(`${chainName}: Found ${providerIds.length} providers for staked events`);

    for (const providerId of providerIds) {
      try {
        const provider = providers.get(providerId);
        if (!provider) {
          logError(`${chainName}: Provider ${providerId} not found in providers map`);
          continue;
        }

        const allEvents = [];
        for (let blockStart = startBlock; blockStart < currentBlock; blockStart += BigInt(chunkSize)) {
          const blockEnd =
            blockStart + BigInt(chunkSize) > currentBlock ? currentBlock : blockStart + BigInt(chunkSize);

          try {
            const chunkEvents = await client.getContractEvents({
              address: contractAddress as `0x${string}`,
              abi: abi,
              eventName: 'StakedWithProvider',
              args: {
                providerIdentifier: providerId,
              },
              fromBlock: blockStart,
              toBlock: blockEnd,
            });

            allEvents.push(...chunkEvents);
          } catch (e: any) {
            logError(
              `${chainName}: Failed to fetch staked events for provider ${providerId}, blocks ${blockStart}-${blockEnd}: ${e.message}`,
            );
          }
        }

        if (allEvents.length === 0) {
          continue;
        }

        logInfo(`${chainName}: Found ${allEvents.length} staked events for provider ${providerId}`);

        for (const event of allEvents) {
          try {
            const args = event.args as {
              providerIdentifier: bigint;
              rollupAddress: `0x${string}`;
              attester: `0x${string}`;
            };
            const block = await client.getBlock({ blockNumber: event.blockNumber! });

            try {
              await eventsClient.aztecStakedEvent.create({
                data: {
                  chainId: dbChain.id,
                  blockNumber: event.blockNumber!.toString(),
                  transactionHash: event.transactionHash!,
                  logIndex: Number(event.logIndex!),
                  providerId: args.providerIdentifier.toString(),
                  providerAddress: getAddress(provider.providerAdmin),
                  rollupAddress: getAddress(args.rollupAddress),
                  attesterAddress: getAddress(args.attester),
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
                logError(`${chainName}: Failed to save staked event at block ${event.blockNumber}: ${dbError.message}`);
              }
            }
          } catch (e: any) {
            logError(`${chainName}: Failed to process staked event at block ${event.blockNumber}: ${e.message}`);
          }
        }
      } catch (e: any) {
        logError(`${chainName}: Error processing provider ${providerId} for staked events: ${e.message}`);
      }
    }

    logInfo(
      `${chainName}: Staked events sync complete - ${totalEvents} total (${newEvents} new, ${skippedEvents} duplicates)`,
    );

    return { success: true, totalEvents, newEvents, skippedEvents };
  } catch (e: any) {
    logError(`${chainName}: Fatal error syncing staked events: ${e.message}`);
    return { success: false, totalEvents, newEvents, skippedEvents, error: e.message };
  }
};
