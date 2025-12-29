import db, { eventsClient } from '@/db';
import logger from '@/logger';
import { getTotalProverRewards } from '@/server/tools/chains/aztec/utils/get-total-prover-rewards';
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

    const proverRewardsRaw = await getTotalProverRewards(chain.name);
    const proverRewards = Number(proverRewardsRaw) / Math.pow(10, chain.coinDecimals);

    const totalRewards = sequencerRewards + proverRewards;

    if (totalRewards <= 0) {
      logWarn(`${chain.name}: Total rewards is zero or negative`);
      return 0;
    }

    const firstEvent = await eventsClient.aztecStakedEvent.findFirst({
      where: { chainId: dbChain.id },
      orderBy: { timestamp: 'asc' },
    });

    if (!firstEvent) {
      logWarn(`${chain.name}: No staking events found`);
      return 0;
    }

    const startDate = new Date(firstEvent.timestamp);
    startDate.setHours(0, 0, 0, 0);

    const events = await eventsClient.aztecStakedEvent.findMany({
      where: {
        chainId: dbChain.id,
        timestamp: { gte: startDate },
      },
      orderBy: { timestamp: 'asc' },
    });

    const eventsByDate = new Map<string, number>();
    for (const event of events) {
      const dateKey = event.timestamp.toISOString().split('T')[0];
      const currentCount = eventsByDate.get(dateKey) || 0;
      eventsByDate.set(dateKey, currentCount + 1);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let stakeDaysSum = 0;
    let cumulativeStaked = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= today) {
      const dateKey = currentDate.toISOString().split('T')[0];

      const eventsCount = eventsByDate.get(dateKey) || 0;
      cumulativeStaked += eventsCount * AZTEC_DELEGATION_AMOUNT;

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
    logInfo(`  - Sequencer rewards: ${sequencerRewards.toLocaleString()} tokens`);
    logInfo(`  - Prover rewards: ${proverRewards.toLocaleString()} tokens`);
    logInfo(`  - Total rewards: ${totalRewards.toLocaleString()} tokens`);
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
