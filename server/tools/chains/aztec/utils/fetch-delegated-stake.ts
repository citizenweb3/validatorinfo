import { getAddress } from 'viem';

import { eventsClient } from '@/db';
import logger from '@/logger';

const { logInfo } = logger('fetch-delegated-stake');

const STAKE_AMOUNT = '200000000000000000000000';

export interface DelegatedStakeResult {
  attesterAddress: string;
  delegatedStake: string;
  hasStake: boolean;
}

export const fetchDelegatedStakes = async (
  attesterAddresses: string[],
  chainId: number,
): Promise<Map<string, DelegatedStakeResult>> => {
  const results = new Map<string, DelegatedStakeResult>();

  const checksummedAddresses = attesterAddresses.map((addr) => getAddress(addr));

  const existingEvents = await eventsClient.aztecStakedEvent.findMany({
    where: {
      chainId,
      attesterAddress: { in: checksummedAddresses },
    },
    select: {
      attesterAddress: true,
      id: true,
    },
  });

  const eventsByAttester = new Map<string, number>();
  for (const event of existingEvents) {
    const count = eventsByAttester.get(event.attesterAddress) || 0;
    eventsByAttester.set(event.attesterAddress, count + 1);
  }

  for (const [attesterAddr, eventCount] of Array.from(eventsByAttester.entries())) {
    const delegatedStake = BigInt(STAKE_AMOUNT) * BigInt(eventCount);
    results.set(attesterAddr, {
      attesterAddress: attesterAddr,
      delegatedStake: delegatedStake.toString(),
      hasStake: true,
    });
  }

  for (const addr of checksummedAddresses) {
    if (!results.has(addr)) {
      results.set(addr, {
        attesterAddress: addr,
        delegatedStake: '0',
        hasStake: false,
      });
    }
  }

  logInfo(`Found ${eventsByAttester.size}/${checksummedAddresses.length} attesters with stake events in DB`);

  return results;
};
