import { Abi } from 'viem';

import db, { eventsClient } from '@/db';
import logger from '@/logger';
import {
  contracts,
  deploymentBlocks,
  getL1,
  stakingRegistryAbis,
} from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { getProviders } from '@/server/tools/chains/aztec/utils/get-providers';
import { getChainParams } from '@/server/tools/chains/params';
import { createViemClientWithFailover } from '@/server/utils/viem-client-with-failover';
import { getChunkSizeForRpcUrls } from '@/server/tools/chains/aztec/utils/get-chunck-size-rpc';

const { logInfo, logError, logWarn } = logger('sync-aztec-attester-events');

const AZTEC_CHAINS = ['aztec', 'aztec-testnet'] as const;

const syncAztecAttesterEvents = async () => {
  logInfo('Starting Aztec attester events sync');

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

      const contractAddress = contracts[chainName].stakingRegistryAddress;
      const abi = stakingRegistryAbis[chainName] as Abi;
      const deploymentBlock = BigInt(deploymentBlocks[chainName]);
      const chunkSize = getChunkSizeForRpcUrls(l1RpcUrls);

      const client = createViemClientWithFailover(l1RpcUrls, {
        loggerName: `${chainName}-attester-events-sync`,
      });

      // Try to get last synced event from events database with fallback
      let lastEvent;
      try {
        lastEvent = await eventsClient.aztecAttesterEvent.findFirst({
          where: { chainId: dbChain.id },
          orderBy: { blockNumber: 'desc' },
        });
      } catch (error: any) {
        logError(`${chainName}: Events DB unavailable - ${error.message}`);
        logWarn(`${chainName}: Starting sync from deployment block (events DB inaccessible)`);
        lastEvent = null;
      }

      const startBlock = lastEvent ? BigInt(lastEvent.blockNumber) + BigInt(1) : deploymentBlock;
      const currentBlock = await client.getBlockNumber();

      if (startBlock > currentBlock) {
        logInfo(`${chainName}: Already up to date (last synced block: ${startBlock}, current: ${currentBlock})`);
        continue;
      }

      logInfo(
        `${chainName}: Syncing from block ${startBlock} to ${currentBlock} (${currentBlock - startBlock} blocks)`,
      );

      const providers = await getProviders(l1RpcUrls, chainName);
      const providerIds = Array.from(providers.keys());

      logInfo(`${chainName}: Found ${providerIds.length} providers to query events for`);

      let totalEvents = 0;
      let newEvents = 0;
      let skippedEvents = 0;

      for (const providerId of providerIds) {
        try {
          const provider = providers.get(providerId);
          if (!provider) {
            logError(`${chainName}: Provider ${providerId} not found in providers map`);
            continue;
          }

          logInfo(`${chainName}: Fetching events for provider ${providerId} (${provider.providerAdmin})`);

          const allEvents = [];
          for (let blockStart = startBlock; blockStart < currentBlock; blockStart += BigInt(chunkSize)) {
            const blockEnd =
              blockStart + BigInt(chunkSize) > currentBlock ? currentBlock : blockStart + BigInt(chunkSize);

            try {
              const chunkEvents = await client.getContractEvents({
                address: contractAddress as `0x${string}`,
                abi: abi,
                eventName: 'AttestersAddedToProvider',
                args: {
                  providerIdentifier: providerId,
                },
                fromBlock: blockStart,
                toBlock: blockEnd,
              });

              allEvents.push(...chunkEvents);
            } catch (e: any) {
              logError(
                `${chainName}: Failed to fetch events for provider ${providerId}, blocks ${blockStart}-${blockEnd}: ${e.message}`,
              );
            }
          }

          if (allEvents.length === 0) {
            logWarn(`${chainName}: No new events for provider ${providerId}`);
            continue;
          }

          logInfo(`${chainName}: Found ${allEvents.length} events for provider ${providerId}, storing in database`);

          for (const event of allEvents) {
            try {
              const args = event.args as { providerIdentifier: bigint; attesters: string[] };
              const block = await client.getBlock({ blockNumber: event.blockNumber! });

              // Save event to events database with error handling
              try {
                await eventsClient.aztecAttesterEvent.create({
                  data: {
                    chainId: dbChain.id,
                    blockNumber: event.blockNumber!.toString(),
                    transactionHash: event.transactionHash!,
                    logIndex: Number(event.logIndex!),
                    providerId: args.providerIdentifier.toString(),
                    providerAddress: provider.providerAdmin,
                    attesters: args.attesters,
                    timestamp: new Date(Number(block.timestamp) * 1000),
                  },
                });

                newEvents++;
                totalEvents++;
              } catch (dbError: any) {
                if (dbError.code === 'P2002') {
                  // Duplicate event, skip
                  skippedEvents++;
                  totalEvents++;
                } else {
                  logError(
                    `${chainName}: Failed to save event to events DB at block ${event.blockNumber}: ${dbError.message}`,
                  );
                  // Continue processing other events instead of crashing
                }
              }
            } catch (e: any) {
              logError(`${chainName}: Failed to process event at block ${event.blockNumber}: ${e.message}`);
            }
          }
        } catch (e: any) {
          logError(`${chainName}: Error processing provider ${providerId}: ${e.message}`);
        }
      }

      logInfo(
        `${chainName}: Sync complete - ${totalEvents} total events (${newEvents} new, ${skippedEvents} duplicates skipped)`,
      );
    } catch (e: any) {
      logError(`Error processing ${chainName}: ${e.message}`);
    }
  }

  logInfo('Aztec attester events sync completed');
};

export default syncAztecAttesterEvents;
