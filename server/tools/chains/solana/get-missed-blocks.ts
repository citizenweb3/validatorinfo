import logger from '@/logger';
import { GetMissedBlocks } from '@/server/tools/chains/chain-indexer';
import fetchSolanaData from '@/server/tools/chains/solana/utils/fetch-solana-data';
import { SlashingSigningInfos } from '@/server/types';

const { logError } = logger('solana-missed-blocks');

const getMissedBlocks: GetMissedBlocks = async (chain, dbChain) => {
  if (!dbChain.params?.blocksWindow || dbChain.params.blocksWindow <= 0) {
    logError(`Invalid blocksWindow (${dbChain.params?.blocksWindow}) for chain ${chain.name}`);
    return [];
  }

  try {
    const currentSlot = await fetchSolanaData<number>('getSlot');

    const startSlot = currentSlot - dbChain.params.blocksWindow;

    if (typeof currentSlot !== 'number' || isNaN(currentSlot)) {
      logError(`currentSlot is invalid: ${currentSlot}`);
      return [];
    }

    if (dbChain.params.blocksWindow > 5000) {
      logError(`blocksWindow too big for public Solana RPC (max 5000 blocks): ${dbChain.params.blocksWindow}`);
      return [];
    }

    const filledSlots: number[] = await fetchSolanaData<number[]>('getBlocks', [startSlot, currentSlot]);

    if (!Array.isArray(filledSlots)) {
      logError(`filledSlots is not array: ${filledSlots}`);
      return [];
    }

    const filledSet = new Set(filledSlots);

    const leaders = await fetchSolanaData<string[]>('getSlotLeaders', [startSlot, dbChain.params.blocksWindow]);

    if (!Array.isArray(leaders) || leaders.length === 0) {
      logError(`leaders array invalid: got ${leaders?.length}, expected ${dbChain.params.blocksWindow}`);
      return [];
    }

    const validatorStats: Record<string, { missed_blocks_counter: number }> = {};

    leaders.forEach((leader, i) => {
      if (!validatorStats[leader]) {
        validatorStats[leader] = { missed_blocks_counter: 0 };
      }
      const slot = startSlot + i;
      if (!filledSet.has(slot)) {
        validatorStats[leader].missed_blocks_counter += 1;
      }
    });

    const slashingInfos: SlashingSigningInfos[] = Object.entries(validatorStats).map(([address, stats]) => ({
      address,
      missed_blocks_counter: String(stats.missed_blocks_counter),
    }));

    return slashingInfos;
  } catch (e) {
    logError(`Error fetching missed blocks for ${chain.name}:`, e);
    return [];
  }
};

export default getMissedBlocks;
