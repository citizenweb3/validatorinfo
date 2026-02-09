import { decodeEventLog, getAddress, parseAbiItem } from 'viem';

import db, { eventsClient } from '@/db';
import logger from '@/logger';
import { contracts, getL1 } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { getChainParams } from '@/server/tools/chains/params';
import { createViemClientWithFailover } from '@/server/utils/viem-client-with-failover';

const { logInfo, logError } = logger('update-aztec-coinbase-address');

const AZTEC_CHAINS = ['aztec', 'aztec-testnet'] as const;

const stakedWithProviderEvent = parseAbiItem(
  'event StakedWithProvider(uint256 indexed providerIdentifier, address indexed rollupAddress, address indexed attester, address coinbaseSplitContractAddress, address stakerImplementation)',
);

const updateAztecCoinbaseAddress = async () => {
  logInfo('Starting Aztec coinbase address update job');

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

      const client = createViemClientWithFailover(l1RpcUrls, {
        loggerName: `${chainName}-coinbase-update`,
      });

      const contractAddress = contracts[chainName].stakingRegistryAddress;

      const eventsToUpdate = await eventsClient.aztecStakedEvent.findMany({
        where: {
          chainId: dbChain.id,
          OR: [{ coinbaseSplitContractAddress: null }, { stakerImplementation: null }],
        },
        select: {
          id: true,
          transactionHash: true,
          logIndex: true,
        },
      });

      if (eventsToUpdate.length === 0) {
        logInfo(`${chainName}: All events are up to date (no missing fields)`);
        continue;
      }

      logInfo(`${chainName}: Found ${eventsToUpdate.length} events to update`);

      let updated = 0;
      let failed = 0;

      const BATCH_SIZE = 10;
      const DELAY_MS = 1000;

      for (let i = 0; i < eventsToUpdate.length; i += BATCH_SIZE) {
        const batch = eventsToUpdate.slice(i, i + BATCH_SIZE);

        const results = await Promise.allSettled(
          batch.map(async (event) => {
            try {
              const receipt = await client.getTransactionReceipt({
                hash: event.transactionHash as `0x${string}`,
              });

              const log = receipt.logs.find(
                (log) =>
                  log.address.toLowerCase() === contractAddress.toLowerCase() &&
                  Number(log.logIndex) === event.logIndex,
              );

              if (!log) {
                throw new Error(`Log not found for tx ${event.transactionHash} at index ${event.logIndex}`);
              }

              const decoded = decodeEventLog({
                abi: [stakedWithProviderEvent],
                data: log.data,
                topics: log.topics,
              });

              const args = decoded.args as {
                coinbaseSplitContractAddress: `0x${string}`;
                stakerImplementation: `0x${string}`;
              };

              await eventsClient.aztecStakedEvent.update({
                where: { id: event.id },
                data: {
                  coinbaseSplitContractAddress: args.coinbaseSplitContractAddress
                    ? getAddress(args.coinbaseSplitContractAddress)
                    : null,
                  stakerImplementation: args.stakerImplementation ? getAddress(args.stakerImplementation) : null,
                },
              });

              return { success: true };
            } catch (error: any) {
              logError(`Failed to update event ${event.id} (tx: ${event.transactionHash}): ${error.message}`);
              return { success: false };
            }
          }),
        );

        const successful = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
        updated += successful;
        failed += results.length - successful;

        if (i + BATCH_SIZE < eventsToUpdate.length) {
          await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
        }
      }

      logInfo(`${chainName}: ✓ Updated ${updated} events, ${failed} failed`);
    } catch (error: any) {
      logError(`Error processing ${chainName}: ${error.message}`);
    }
  }

  logInfo('Aztec coinbase address update completed');
};

export default updateAztecCoinbaseAddress;
