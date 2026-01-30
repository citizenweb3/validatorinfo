import { eventsClient } from '@/db';
import logger from '@/logger';

const { logInfo, logError, logWarn } = logger('get-unbonding-tokens-aztec');

export const getUnbondingTokens = async (chainId: number): Promise<bigint> => {
  try {
    const [initiatedEvents, finalizedEvents] = await Promise.all([
      eventsClient.aztecWithdrawInitiatedEvent.findMany({
        where: { chainId },
        select: { amount: true },
      }),
      eventsClient.aztecWithdrawFinalizedEvent.findMany({
        where: { chainId },
        select: { amount: true },
      }),
    ]);

    let totalInitiated = BigInt(0);
    for (const event of initiatedEvents) {
      totalInitiated += BigInt(event.amount);
    }

    let totalFinalized = BigInt(0);
    for (const event of finalizedEvents) {
      totalFinalized += BigInt(event.amount);
    }

    const unbondingTokens = totalInitiated - totalFinalized;

    if (unbondingTokens < 0) {
      logWarn(
        `CRITICAL: Negative unbonding tokens detected! ` +
        `initiated=${totalInitiated}, finalized=${totalFinalized}, diff=${unbondingTokens}. ` +
        `This indicates missing WithdrawInitiated events or data corruption.`,
      );
      return BigInt(0);
    }

    logInfo(
      `Unbonding tokens: ${initiatedEvents.length} initiated (${totalInitiated}), ${finalizedEvents.length} finalized (${totalFinalized}), unbonding = ${unbondingTokens}`,
    );

    return unbondingTokens;
  } catch (e: any) {
    logError(`Failed to calculate unbonding tokens: ${e.message}`);
    throw e;
  }
};
