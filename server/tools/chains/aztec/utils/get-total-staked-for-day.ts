import { eventsClient } from '@/db';
import logger from '@/logger';

const { logInfo } = logger('get-total-staked-for-day-aztec');

const AZTEC_DELEGATION_AMOUNT = BigInt(200_000);
const WEI_MULTIPLIER = BigInt(10 ** 18);
const ZERO = BigInt(0);

export const getTotalStakedForDay = async (chainId: number, date: Date): Promise<bigint> => {
  // Use UTC to ensure consistent results across timezones
  const dateStr = date.toISOString().split('T')[0];
  const endOfDay = new Date(dateStr + 'T23:59:59.999Z');

  const [queuedEvents, withdrawEvents, slashedEvents] = await Promise.all([
    eventsClient.aztecValidatorQueuedEvent.findMany({
      where: { chainId, timestamp: { lte: endOfDay } },
    }),
    eventsClient.aztecWithdrawFinalizedEvent.findMany({
      where: { chainId, timestamp: { lte: endOfDay } },
    }),
    eventsClient.aztecSlashedEvent.findMany({
      where: { chainId, timestamp: { lte: endOfDay } },
    }),
  ]);

  let totalStaked = ZERO;

  totalStaked += BigInt(queuedEvents.length) * AZTEC_DELEGATION_AMOUNT * WEI_MULTIPLIER;

  totalStaked -= BigInt(withdrawEvents.length) * AZTEC_DELEGATION_AMOUNT * WEI_MULTIPLIER;

  for (const event of slashedEvents) {
    totalStaked -= BigInt(event.amount);
  }

  logInfo(
    `Staked for ${date.toISOString().split('T')[0]}: ` +
    `${queuedEvents.length} queued, ${withdrawEvents.length} withdrawn, ` +
    `${slashedEvents.length} slashed, total=${totalStaked}`,
  );

  return totalStaked < ZERO ? ZERO : totalStaked;
};
