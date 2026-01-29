/**
 * @deprecated This method is no longer used for fetching current APR.
 * Current APR data is synced from time series table (ChainAprHistory) by:
 * - server/jobs/update-aztec-apr-history.ts
 *
 * The job calculates daily APR and syncs the latest value to tokenomics table.
 * Kept for reference and potential fallback.
 */

import db, { eventsClient } from '@/db';
import logger from '@/logger';
import { AddChainProps, GetAprFunction } from '@/server/tools/chains/chain-indexer';

const { logInfo, logError, logWarn } = logger('aztec-get-apr');

const AZTEC_DELEGATION_AMOUNT = 200_000;
const DAYS_IN_YEAR = 365;

const getApr: GetAprFunction = async (chain: AddChainProps) => {
  try {
    const dbChain = await db.chain.findFirst({
      where: { chainId: chain.chainId },
      include: { tokenomics: true, nodes: true },
    });

    if (!dbChain) {
      logError(`Chain ${chain.chainId} not found in database`);
      return 0;
    }

    const sequencerRewardsRaw = dbChain.tokenomics?.rewardsToPayout || '0';
    const sequencerRewards = Number(BigInt(sequencerRewardsRaw)) / Math.pow(10, chain.coinDecimals);

    // NOTE: Only sequencer rewards go to stakers, prover rewards are separate
    const totalRewards = sequencerRewards;

    if (totalRewards <= 0) {
      logWarn(`${chain.name}: Total rewards is zero or negative`);
      return 0;
    }

    // Use ValidatorQueued events (includes both delegated and self-staked validators)
    const firstQueuedEvent = await eventsClient.aztecValidatorQueuedEvent.findFirst({
      where: { chainId: dbChain.id },
      orderBy: { timestamp: 'asc' },
    });

    if (!firstQueuedEvent) {
      logWarn(`${chain.name}: No ValidatorQueued events found`);
      return 0;
    }

    const startDate = new Date(firstQueuedEvent.timestamp);
    startDate.setHours(0, 0, 0, 0);

    // Fetch both ValidatorQueued and WithdrawFinalized events
    const [queuedEvents, withdrawEvents] = await Promise.all([
      eventsClient.aztecValidatorQueuedEvent.findMany({
        where: {
          chainId: dbChain.id,
          timestamp: { gte: startDate },
        },
        orderBy: { timestamp: 'asc' },
      }),
      eventsClient.aztecWithdrawFinalizedEvent.findMany({
        where: {
          chainId: dbChain.id,
          timestamp: { gte: startDate },
        },
        orderBy: { timestamp: 'asc' },
      }),
    ]);

    // Track net change per day: +1 for queued, -1 for withdraw
    const netChangeByDate = new Map<string, number>();

    for (const event of queuedEvents) {
      const dateKey = event.timestamp.toISOString().split('T')[0];
      const currentCount = netChangeByDate.get(dateKey) || 0;
      netChangeByDate.set(dateKey, currentCount + 1);
    }

    for (const event of withdrawEvents) {
      const dateKey = event.timestamp.toISOString().split('T')[0];
      const currentCount = netChangeByDate.get(dateKey) || 0;
      netChangeByDate.set(dateKey, currentCount - 1);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let stakeDaysSum = 0;
    let cumulativeStaked = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= today) {
      const dateKey = currentDate.toISOString().split('T')[0];

      const netChange = netChangeByDate.get(dateKey) || 0;
      cumulativeStaked += netChange * AZTEC_DELEGATION_AMOUNT;

      // Ensure we don't go negative
      if (cumulativeStaked < 0) cumulativeStaked = 0;

      stakeDaysSum += cumulativeStaked;

      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (stakeDaysSum <= 0) {
      logWarn(`${chain.name}: Stake days sum is zero`);
      return 0;
    }

    let avgCommission = 0;
    if (dbChain.nodes && dbChain.nodes.length > 0) {
      const totalCommission = dbChain.nodes.reduce((sum, node) => {
        const rate = parseFloat(node.rate) || 0;
        return sum + rate;
      }, 0);
      avgCommission = totalCommission / dbChain.nodes.length;
    }

    const baseApr = (totalRewards / stakeDaysSum) * DAYS_IN_YEAR;
    const apr = baseApr * (1 - avgCommission);

    const totalDays = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    logInfo(`${chain.name}: APR calculation:`);
    logInfo(`  - Sequencer rewards (total for stakers): ${sequencerRewards.toLocaleString()} tokens`);
    logInfo(`  - ValidatorQueued events: ${queuedEvents.length}`);
    logInfo(`  - WithdrawFinalized events: ${withdrawEvents.length}`);
    logInfo(`  - Stake days sum: ${stakeDaysSum.toLocaleString()} token-days`);
    logInfo(`  - Current staked: ${cumulativeStaked.toLocaleString()} tokens`);
    logInfo(`  - Days since first stake: ${totalDays}`);
    logInfo(`  - Average daily stake: ${(stakeDaysSum / totalDays).toLocaleString()} tokens`);
    logInfo(`  - Average commission: ${(avgCommission * 100).toFixed(2)}%`);
    logInfo(`  - Base APR (before commission): ${(baseApr * 100).toFixed(4)}%`);
    logInfo(`  - Net APR (after commission): ${(apr * 100).toFixed(4)}%`);

    return apr;
  } catch (error: any) {
    logError(`Failed to calculate APR for ${chain.name}: ${error.message}`);
    return 0;
  }
};

export default getApr;
