import logger from '@/logger';
import { GetMissedBlocks } from '@/server/tools/chains/chain-indexer';
import { jsonRpcClientWithFailover } from '@/server/utils/json-rpc-client';
import { SlashingSigningInfos } from '@/server/types';

const { logError } = logger('solana-missed-blocks');

const getMissedBlocks: GetMissedBlocks = async (chain, dbChain) => {
  if (!dbChain.params?.blocksWindow || dbChain.params.blocksWindow <= 0) {
    logError(`Invalid blocksWindow (${dbChain.params?.blocksWindow}) for chain ${chain.name}`);
    return [];
  }

  try {
    const rpcUrls = chain.nodes.filter((n: any) => n.type === 'rpc').map((n: any) => n.url);
    if (!rpcUrls.length) {
      throw new Error('No RPC URLs provided in chain object');
    }

    const currentSlot = await jsonRpcClientWithFailover<number>(
      rpcUrls,
      'getSlot',
      undefined,
      'solana-missed-blocks'
    );

    const startSlot = currentSlot - dbChain.params.blocksWindow;

    if (typeof currentSlot !== 'number' || isNaN(currentSlot)) {
      logError(`currentSlot is invalid: ${currentSlot}`);
      return [];
    }

    if (dbChain.params.blocksWindow > 5000) {
      logError(`blocksWindow too big for public Solana RPC (max 5000 blocks): ${dbChain.params.blocksWindow}`);
      return [];
    }

    const filledSlots: number[] = await jsonRpcClientWithFailover<number[]>(
      rpcUrls,
      'getBlocks',
      [startSlot, currentSlot],
      'solana-missed-blocks'
    );

    if (!Array.isArray(filledSlots)) {
      logError(`filledSlots is not array: ${filledSlots}`);
      return [];
    }

    const filledSet = new Set(filledSlots);

    const leaders = await jsonRpcClientWithFailover<string[]>(
      rpcUrls,
      'getSlotLeaders',
      [startSlot, dbChain.params.blocksWindow],
      'solana-missed-blocks'
    );

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
