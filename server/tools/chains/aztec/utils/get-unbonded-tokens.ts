import { eventsClient } from '@/db';
import logger from '@/logger';

const { logInfo, logError } = logger('get-unbonded-tokens-aztec');

export const getUnbondedTokens = async (chainId: number): Promise<bigint> => {
  try {
    const withdrawEvents = await eventsClient.aztecWithdrawFinalizedEvent.findMany({
      where: { chainId },
      select: { amount: true },
    });

    let total = BigInt(0);
    for (const event of withdrawEvents) {
      total += BigInt(event.amount);
    }

    logInfo(`Unbonded tokens: ${withdrawEvents.length} withdrawals, total = ${total}`);

    return total;
  } catch (e: any) {
    logError(`Failed to calculate unbonded tokens: ${e.message}`);
    throw e;
  }
};
