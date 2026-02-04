import db from '@/db';
import logger from '@/logger';
import { getActiveSequencers } from '@/server/tools/chains/aztec/utils/get-active-sequencers';
import { getEntryQueueValidators } from '@/server/tools/chains/aztec/utils/get-entry-queue-length';
import { getExitingSequencers } from '@/server/tools/chains/aztec/utils/get-exiting-sequencers';
import { getExitedSequencers } from '@/server/tools/chains/aztec/utils/get-exited-sequencers';
import { getZombieValidators } from '@/server/tools/chains/aztec/utils/get-zombie-validators';

const { logInfo, logError } = logger('update-aztec-node-distribution');

interface NodeDistribution {
  total: number;
  active: number;
  inQueue: number;
  zombie: number;
  exiting: number;
}

const calculateNodeDistribution = async (chainId: number): Promise<NodeDistribution> => {
  const [activeSequencers, entryQueueValidators, exitingValidators, zombieValidators, exitedSequencers] =
    await Promise.all([
      getActiveSequencers(chainId),
      getEntryQueueValidators(chainId),
      getExitingSequencers(chainId),
      getZombieValidators(chainId),
      getExitedSequencers(chainId),
    ]);

  let activeCount = 0;
  for (const [attester] of Array.from(activeSequencers.entries())) {
    if (!exitingValidators.has(attester) && !zombieValidators.has(attester)) {
      activeCount++;
    }
  }

  const inQueueCount = entryQueueValidators.size;
  const zombieCount = zombieValidators.size;
  const exitingCount = exitingValidators.size;
  const total = activeCount + inQueueCount + zombieCount + exitingCount;

  return {
    total,
    active: activeCount,
    inQueue: inQueueCount,
    zombie: zombieCount,
    exiting: exitingCount,
  };
};

export const updateAztecNodeDistribution = async (
  chainName: 'aztec' | 'aztec-testnet',
): Promise<void> => {
  logInfo(`Starting node distribution update for ${chainName}`);

  try {
    const chain = await db.chain.findUnique({
      where: { name: chainName },
    });

    if (!chain) {
      logError(`Chain not found: ${chainName}`);
      return;
    }

    const distribution = await calculateNodeDistribution(chain.id);

    logInfo(
      `${chainName}: Distribution - total: ${distribution.total}, active: ${distribution.active}, ` +
        `inQueue: ${distribution.inQueue}, zombie: ${distribution.zombie}, exiting: ${distribution.exiting}`,
    );

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    await db.aztecNodeDistributionHistory.upsert({
      where: {
        chainId_date: {
          chainId: chain.id,
          date: today,
        },
      },
      create: {
        chainId: chain.id,
        date: today,
        total: distribution.total,
        active: distribution.active,
        inQueue: distribution.inQueue,
        zombie: distribution.zombie,
        exiting: distribution.exiting,
      },
      update: {
        total: distribution.total,
        active: distribution.active,
        inQueue: distribution.inQueue,
        zombie: distribution.zombie,
        exiting: distribution.exiting,
      },
    });

    logInfo(`${chainName}: Node distribution history updated for ${today.toISOString().split('T')[0]}`);
  } catch (error: any) {
    logError(`${chainName}: Failed to update node distribution: ${error.message}`);
    throw error;
  }
};

export const getAztecNodeDistribution = async (
  chainName: 'aztec' | 'aztec-testnet',
): Promise<NodeDistribution | null> => {
  try {
    const chain = await db.chain.findUnique({
      where: { name: chainName },
    });

    if (!chain) {
      logError(`Chain not found: ${chainName}`);
      return null;
    }

    return await calculateNodeDistribution(chain.id);
  } catch (error: any) {
    logError(`${chainName}: Failed to get node distribution: ${error.message}`);
    return null;
  }
};

export default updateAztecNodeDistribution;
