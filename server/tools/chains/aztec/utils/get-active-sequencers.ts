import { getAddress } from 'viem';

import { eventsClient } from '@/db';
import logger from '@/logger';

const { logInfo } = logger('get-active-sequencers');

export const getActiveSequencers = async (chainId: number): Promise<Map<string, string>> => {
  const queuedEvents = await eventsClient.aztecValidatorQueuedEvent.findMany({
    where: { chainId },
    orderBy: { id: 'asc' },
  });

  const exitedEvents = await eventsClient.aztecWithdrawFinalizedEvent.findMany({
    where: { chainId },
    orderBy: { id: 'asc' },
  });

  logInfo(`Processing ${queuedEvents.length} ValidatorQueued and ${exitedEvents.length} WithdrawFinalized events`);

  const latestQueued = new Map<string, { blockNumber: bigint; withdrawer: string }>();
  for (const event of queuedEvents) {
    const addr = getAddress(event.attester);
    const blockNum = BigInt(event.blockNumber);
    const existing = latestQueued.get(addr);

    if (!existing || blockNum > existing.blockNumber) {
      latestQueued.set(addr, {
        blockNumber: blockNum,
        withdrawer: getAddress(event.withdrawer),
      });
    }
  }

  const latestExited = new Map<string, bigint>();
  for (const event of exitedEvents) {
    const addr = getAddress(event.attester);
    const blockNum = BigInt(event.blockNumber);
    const existing = latestExited.get(addr);

    if (!existing || blockNum > existing) {
      latestExited.set(addr, blockNum);
    }
  }

  const activeSequencers = new Map<string, string>();

  for (const [attester, queuedData] of Array.from(latestQueued.entries())) {
    const exitedBlock = latestExited.get(attester);

    if (!exitedBlock || queuedData.blockNumber > exitedBlock) {
      activeSequencers.set(attester, queuedData.withdrawer);
    }
  }

  logInfo(
    `Found ${activeSequencers.size} active sequencers ` +
    `(${latestQueued.size} total registered, ${latestExited.size} have exit events)`
  );

  return activeSequencers;
};
