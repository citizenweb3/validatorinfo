import { getAddress } from 'viem';

import { eventsClient } from '@/db';
import logger from '@/logger';

const { logInfo } = logger('get-exiting-validators');

export const getExitingSequencers = async (chainId: number): Promise<Set<string>> => {
  const [initiatedEvents, finalizedEvents] = await Promise.all([
    eventsClient.aztecWithdrawInitiatedEvent.findMany({
      where: { chainId },
      distinct: ['attester'],
      select: { attester: true },
    }),
    eventsClient.aztecWithdrawFinalizedEvent.findMany({
      where: { chainId },
      distinct: ['attester'],
      select: { attester: true },
    }),
  ]);

  const finalized = new Set<string>();
  for (const event of finalizedEvents) {
    finalized.add(getAddress(event.attester));
  }

  const exiting = new Set<string>();
  for (const event of initiatedEvents) {
    const address = getAddress(event.attester);
    if (!finalized.has(address)) {
      exiting.add(address);
    }
  }

  logInfo(`Found ${exiting.size} validators in EXITING status (initiated: ${initiatedEvents.length}, finalized: ${finalizedEvents.length})`);

  return exiting;
};
