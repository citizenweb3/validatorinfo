import { Abi, getAddress } from 'viem';

import db from '@/db';
import logger from '@/logger';
import {
  AztecChainName,
  contracts,
  deploymentBlocks,
  stakingRegistryAbis,
} from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { getChunkSizeForRpcUrls } from '@/server/tools/chains/aztec/utils/get-chunck-size-rpc';
import { getProviders } from '@/server/tools/chains/aztec/utils/get-providers';
import { getChainParams } from '@/server/tools/chains/params';
import { createViemClientWithFailover } from '@/server/utils/viem-client-with-failover';

export const getProviderAttesters = async (
  rpcUrls: string[],
  chainName: AztecChainName,
): Promise<Map<string, bigint>> => {
  const { logInfo, logError, logWarn } = logger(`${chainName}-get-provider-attesters`);

  if (rpcUrls.length === 0) {
    return new Map();
  }

  try {
    const chainParams = getChainParams(chainName);
    const dbChain = await db.chain.findFirst({
      where: { chainId: chainParams.chainId },
    });

    if (dbChain) {
      const events = await db.aztecAttesterEvent.findMany({
        where: { chainId: dbChain.id },
        orderBy: { blockNumber: 'asc' },
      });

      if (events.length > 0) {
        logInfo(`Found ${events.length} events in database, using cached data`);

        const attesterToProvider = new Map<string, bigint>();

        for (const event of events) {
          const providerId = BigInt(event.providerId);

          for (const attester of event.attesters) {
            if (typeof attester === 'string' && attester.startsWith('0x')) {
              const checksummedAttester = getAddress(attester);
              attesterToProvider.set(checksummedAttester, providerId);
            }
          }
        }

        logInfo(`Total: Mapped ${attesterToProvider.size} attesters to providers from database`);
        return attesterToProvider;
      } else {
        logError('No events found in database, falling back to blockchain query');
      }
    }
  } catch (e: any) {
    logError(`Failed to read from database: ${e.message}, falling back to blockchain query`);
  }

  const contractAddress = contracts[chainName].stakingRegistryAddress;
  const abi = stakingRegistryAbis[chainName] as Abi;
  const deploymentBlock = deploymentBlocks[chainName];
  const chunkSize = getChunkSizeForRpcUrls(rpcUrls);

  try {
    const client = createViemClientWithFailover(rpcUrls, {
      loggerName: `${chainName}-provider-wallet-txs-events`,
    });

    const providers = await getProviders(rpcUrls, chainName);

    if (providers.size === 0) {
      logError('No providers found');
      return new Map();
    }

    logInfo(`Found ${providers.size} providers, querying transactions from their admin wallets`);

    const currentBlock = await client.getBlockNumber();
    const attesterToProvider = new Map<string, bigint>();

    const providerEntries = Array.from(providers.entries());

    for (const [providerId, provider] of providerEntries) {
      try {
        logInfo(`Fetching attesters for provider ${providerId} (${provider.providerAdmin})`);

        const allEvents = [];
        for (let startBlock = BigInt(deploymentBlock); startBlock < currentBlock; startBlock += BigInt(chunkSize)) {
          const endBlock =
            startBlock + BigInt(chunkSize) > currentBlock ? currentBlock : startBlock + BigInt(chunkSize);

          try {
            const chunkEvents = await client.getContractEvents({
              address: contractAddress as `0x${string}`,
              abi: abi,
              eventName: 'AttestersAddedToProvider',
              args: {
                providerIdentifier: providerId,
              },
              fromBlock: startBlock,
              toBlock: endBlock,
            });
            allEvents.push(...chunkEvents);
          } catch (e: any) {
            logError(
              `Failed to fetch events for provider ${providerId}, blocks ${startBlock}-${endBlock}: ${e.message}`,
            );
          }
        }

        logInfo(`Found ${allEvents.length} AttestersAddedToProvider events for provider ${providerId}`);

        const sortedEvents = [...allEvents].sort((a, b) => {
          if (a.blockNumber !== b.blockNumber) {
            return Number(a.blockNumber!) - Number(b.blockNumber!);
          }
          const aIndex = a.logIndex !== undefined ? Number(a.logIndex) : 0;
          const bIndex = b.logIndex !== undefined ? Number(b.logIndex) : 0;
          return aIndex - bIndex;
        });

        for (const event of sortedEvents) {
          const args = event.args;
          if (!args || typeof args !== 'object') {
            logError(`Invalid event args structure at block ${event.blockNumber}`);
            continue;
          }

          const { attesters } = args as { providerIdentifier: bigint; attesters: string[] };

          if (!Array.isArray(attesters)) {
            logWarn(`Invalid attesters type at block ${event.blockNumber}`);
            continue;
          }

          for (const attester of attesters) {
            if (typeof attester === 'string' && attester.startsWith('0x')) {
              const checksummedAttester = getAddress(attester);
              attesterToProvider.set(checksummedAttester, providerId);
              logInfo(`Mapped attester ${checksummedAttester} to provider ${providerId}`);
            }
          }
        }
      } catch (e: any) {
        logError(`Error processing provider ${providerId}: ${e.message}`);
      }
    }

    logInfo(`Total: Mapped ${attesterToProvider.size} attesters to providers`);
    return attesterToProvider;
  } catch (e: any) {
    logError(`Failed to fetch provider attester mappings: ${e.message}`);
    return new Map();
  }
};
