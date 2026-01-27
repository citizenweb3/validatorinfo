import db, { eventsClient } from '@/db';
import logger from '@/logger';
import { getActiveSequencers } from '@/server/tools/chains/aztec/utils/get-active-sequencers';
import { AddChainProps } from '@/server/tools/chains/chain-indexer';

const { logInfo, logError, logWarn } = logger('get-bonded-tokens-aztec');

const STAKE_AMOUNT = BigInt('200000000000000000000000');

const getTotalSlashedAmount = async (
  chainId: number,
  activeSequencers: Map<string, string>,
): Promise<bigint> => {
  try {
    const slashEvents = await eventsClient.aztecSlashedEvent.findMany({
      where: { chainId },
      select: { attester: true, amount: true },
    });

    let totalSlashed = BigInt(0);
    for (const event of slashEvents) {
      if (activeSequencers.has(event.attester)) {
        totalSlashed += BigInt(event.amount);
      }
    }

    return totalSlashed;
  } catch (e: any) {
    logWarn(`Failed to get slashed amounts: ${e.message}`);
    return BigInt(0);
  }
};

export const getBondedTokens = async (chain: AddChainProps): Promise<bigint> => {
  try {
    const dbChain = await db.chain.findUnique({
      where: { chainId: chain.chainId },
    });

    if (!dbChain) {
      throw new Error(`Chain ${chain.name} not found in database`);
    }

    const activeSequencers = await getActiveSequencers(dbChain.id);
    const grossStaked = BigInt(activeSequencers.size) * STAKE_AMOUNT;

    const totalSlashed = await getTotalSlashedAmount(dbChain.id, activeSequencers);
    const totalStaked = grossStaked - totalSlashed;

    logInfo(
      `Bonded tokens: ${activeSequencers.size} sequencers × 200k = ${grossStaked}, slashed = ${totalSlashed}, net = ${totalStaked}`,
    );

    const nodeCount = await db.node.count({
      where: { chainId: dbChain.id },
    });

    if (nodeCount !== activeSequencers.size) {
      logWarn(
        `Mismatch: ${nodeCount} nodes in DB vs ${activeSequencers.size} active sequencers from events`,
      );
    }

    return totalStaked;
  } catch (e: any) {
    logError(`Failed to calculate bonded tokens: ${e.message}`);
    throw e;
  }
};
