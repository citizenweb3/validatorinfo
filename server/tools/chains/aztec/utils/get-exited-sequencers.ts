import { getAddress } from 'viem';

import { eventsClient } from '@/db';
import logger from '@/logger';

const { logInfo } = logger('get-exited-sequencers');

export const getExitedSequencers = async (chainId: number): Promise<Set<string>> => {
  const events = await eventsClient.aztecWithdrawFinalizedEvent.findMany({
    where: { chainId },
    distinct: ['attester'],
    select: { attester: true },
  });

  const exited = new Set<string>();

  for (const event of events) {
    exited.add(getAddress(event.attester));
  }

  logInfo(`Found ${exited.size} unique attesters with WithdrawFinalized events`);

  return exited;
};
