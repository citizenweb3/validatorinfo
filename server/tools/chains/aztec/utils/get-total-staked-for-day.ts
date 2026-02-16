import { eventsClient } from '@/db';
import logger from '@/logger';

const { logInfo } = logger('get-total-staked-for-day-aztec');

const AZTEC_DELEGATION_AMOUNT = BigInt(200_000);
const WEI_MULTIPLIER = BigInt(10 ** 18);
const ZERO = BigInt(0);

export type StakeMode = 'bonded' | 'reward-earning';

export const getTotalStakedForDay = async (
  chainId: number,
  date: Date,
  mode: StakeMode = 'bonded',
): Promise<bigint> => {
  // Use UTC to ensure consistent results across timezones
  const dateStr = date.toISOString().split('T')[0];
  const endOfDay = new Date(dateStr + 'T23:59:59.999Z');

  // bonded: Queued × 200k - WithdrawFinalized - Slashed (tokens still locked until finalization)
  // reward-earning: Queued × 200k - WithdrawInitiated - Slashed (exiting don't earn rewards)
  const [queuedEvents, withdrawEvents, slashedEvents] = await Promise.all([
    eventsClient.aztecValidatorQueuedEvent.findMany({
      where: { chainId, timestamp: { lte: endOfDay } },
    }),
    mode === 'bonded'
      ? eventsClient.aztecWithdrawFinalizedEvent.findMany({
          where: { chainId, timestamp: { lte: endOfDay } },
        })
      : eventsClient.aztecWithdrawInitiatedEvent.findMany({
          where: { chainId, timestamp: { lte: endOfDay } },
        }),
    eventsClient.aztecSlashedEvent.findMany({
      where: { chainId, timestamp: { lte: endOfDay } },
    }),
  ]);

  let totalStaked = ZERO;

  totalStaked += BigInt(queuedEvents.length) * AZTEC_DELEGATION_AMOUNT * WEI_MULTIPLIER;

  for (const event of withdrawEvents) {
    totalStaked -= BigInt(event.amount);
  }

  for (const event of slashedEvents) {
    totalStaked -= BigInt(event.amount);
  }

  const withdrawLabel = mode === 'bonded' ? 'finalized' : 'initiated';
  logInfo(
    `Staked [${mode}] for ${dateStr}: ` +
    `${queuedEvents.length} queued, ${withdrawEvents.length} ${withdrawLabel}, ` +
    `${slashedEvents.length} slashed, total=${totalStaked}`,
  );

  return totalStaked < ZERO ? ZERO : totalStaked;
};
