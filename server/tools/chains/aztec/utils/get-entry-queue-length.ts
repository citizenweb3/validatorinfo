import { getAddress } from 'viem';

import { eventsClient } from '@/db';
import logger from '@/logger';

const { logInfo } = logger('get-entry-queue-length');

export const getEntryQueueValidators = async (chainId: number): Promise<Set<string>> => {
  const [depositEvents, queuedEvents, exitedEvents] = await Promise.all([
    eventsClient.aztecDepositEvent.findMany({
      where: { chainId },
      distinct: ['attester'],
      select: { attester: true },
    }),
    eventsClient.aztecValidatorQueuedEvent.findMany({
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

  const queued = new Set<string>();
  for (const event of queuedEvents) {
    queued.add(getAddress(event.attester));
  }

  const exited = new Set<string>();
  for (const event of exitedEvents) {
    exited.add(getAddress(event.attester));
  }

  const inQueue = new Set<string>();
  for (const event of depositEvents) {
    const addr = getAddress(event.attester);
    // Not yet queued (activated) and not exited
    if (!queued.has(addr) && !exited.has(addr)) {
      inQueue.add(addr);
    }
  }

  logInfo(
    `Found ${inQueue.size} validators in entry queue ` +
    `(deposits: ${depositEvents.length}, queued: ${queuedEvents.length}, exited: ${exitedEvents.length})`,
  );

  return inQueue;
};

export const getEntryQueueLength = async (chainId: number): Promise<number> => {
  const validators = await getEntryQueueValidators(chainId);
  return validators.size;
};
