import { getAddress } from 'viem';

import db, { eventsClient } from '@/db';
import logger from '@/logger';
import { AztecChainName } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { getChainParams } from '@/server/tools/chains/params';

export const getProviderAttesters = async (
  _rpcUrls: string[],
  chainName: AztecChainName,
): Promise<Map<string, bigint>> => {
  const { logInfo, logError, logWarn } = logger(`${chainName}-get-provider-attesters`);

  const attesterToProvider = new Map<string, bigint>();

  try {
    const chainParams = getChainParams(chainName);
    const dbChain = await db.chain.findFirst({
      where: { chainId: chainParams.chainId },
    });

    if (!dbChain) {
      logError('Chain not found in database');
      return attesterToProvider;
    }

    const events = await eventsClient.aztecAttesterEvent.findMany({
      where: { chainId: dbChain.id },
      orderBy: { blockNumber: 'asc' },
    });

    if (events.length === 0) {
      logWarn('No attester events found in database. Run sync-aztec-events job first.');
      return attesterToProvider;
    }

    logInfo(`Found ${events.length} attester events in database`);

    for (const event of events) {
      const providerId = BigInt(event.providerId);

      for (const attester of event.attesters) {
        try {
          const checksummedAttester = getAddress(attester);
          attesterToProvider.set(checksummedAttester, providerId);
        } catch (e: any) {
          logWarn(`Invalid attester address in event (block ${event.blockNumber}): ${attester}`);
        }
      }
    }

    logInfo(`Mapped ${attesterToProvider.size} attesters to providers`);
    return attesterToProvider;
  } catch (e: any) {
    logError(`Failed to get provider attesters: ${e.message}`);
    return attesterToProvider;
  }
};
