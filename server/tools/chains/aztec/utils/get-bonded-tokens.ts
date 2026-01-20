import db from '@/db';
import logger from '@/logger';
import { getActiveSequencers } from '@/server/tools/chains/aztec/utils/get-active-sequencers';
import { AddChainProps } from '@/server/tools/chains/chain-indexer';

const { logInfo, logError, logWarn } = logger('get-bonded-tokens-aztec');

const STAKE_AMOUNT = BigInt('200000000000000000000000');

export const getBondedTokens = async (chain: AddChainProps): Promise<bigint> => {
  try {
    const dbChain = await db.chain.findUnique({
      where: { chainId: chain.chainId },
    });

    if (!dbChain) {
      throw new Error(`Chain ${chain.name} not found in database`);
    }

    const activeSequencers = await getActiveSequencers(dbChain.id);

    const totalStaked = BigInt(activeSequencers.size) * STAKE_AMOUNT;

    logInfo(
      `Bonded tokens: ${activeSequencers.size} active sequencers × 200k AZTEC = ${totalStaked}`,
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
