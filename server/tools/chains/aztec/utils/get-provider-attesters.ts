import { getAddress } from 'viem';

import db, { eventsClient } from '@/db';
import logger from '@/logger';
import { AztecChainName } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { getChainParams } from '@/server/tools/chains/params';

/**
 * Get mapping of attester address -> provider ID from the events database.
 *
 * This function reads from pre-synced AttestersAddedToProvider events,
 * making it fast (no blockchain queries).
 *
 * @returns Map<attesterAddress, providerId>
 */
export const getProviderAttesters = async (
  _rpcUrls: string[], // Kept for backwards compatibility, not used
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

    // Read all attester events from database
    const events = await eventsClient.aztecAttesterEvent.findMany({
      where: { chainId: dbChain.id },
      orderBy: { blockNumber: 'asc' },
    });

    if (events.length === 0) {
      logWarn('No attester events found in database. Run sync-aztec-events job first.');
      return attesterToProvider;
    }

    logInfo(`Found ${events.length} attester events in database`);

    // Build attester -> provider mapping
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
