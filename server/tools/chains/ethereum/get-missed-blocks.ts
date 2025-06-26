import logger from '@/logger';
import { GetMissedBlocks } from '@/server/tools/chains/chain-indexer';
import { SlashingSigningInfos } from '@/server/types';
import fetchChainData from '@/server/tools/get-chain-data';

const { logError, logInfo } = logger('eth-missed-blocks');

interface ProposerDuty {
  pubkey: string;
  slot: number;
}

const getMissedBlocks: GetMissedBlocks = async (chain, dbChain) => {
  const restUrl = chain.nodes.find((n: any) => n.type === 'rest')?.url ?? '';
  if (!restUrl) {
    logError(`Chain ${chain.name}: REST (Beacon) URL not provided`);
    return [];
  }

  if (!dbChain.params?.blocksWindow || dbChain.params.blocksWindow <= 0) {
    logError(`Invalid blocksWindow (${dbChain.params?.blocksWindow}) for chain ${chain.name}`);
    return [];
  }

  try {
    const headerSlot = await fetchChainData<any>(
      chain.name,
      'rest',
      '/eth/v1/beacon/headers/head',
    );

    const slotStr =
      headerSlot?.data?.header?.message?.slot ??
      headerSlot?.data?.header?.slot ??
      '';

    const headSlot = parseInt(slotStr);
    if (Number.isNaN(headSlot)) {
      logError(`Invalid structure of header/head; slotStr="${slotStr}"`);
      return [];
    }

    const startSlot = headSlot - dbChain.params.blocksWindow + 1;
    const slotsPerEpoch = 32;
    const currentEpoch = Math.floor(headSlot / slotsPerEpoch);
    const startEpoch = Math.max(0, Math.floor(startSlot / slotsPerEpoch));

    const duties: ProposerDuty[] = [];

    let epochsFetched = 0;
    let epochsFailed = 0;

    for (let epoch = startEpoch; epoch <= currentEpoch; epoch++) {
      try {
        const dutiesJson = await fetchChainData<any>(
          chain.name,
          'rest',
          `/eth/v1/validator/duties/proposer/${epoch}`,
        );
        if (Array.isArray(dutiesJson?.data)) {
          duties.push(...dutiesJson.data);
          epochsFetched++;
        } else {
          logError(`No proposer duties data for epoch ${epoch}`);
          epochsFailed++;
        }
      } catch (e: any) {
        if (typeof e?.message === 'string' && e.message.includes('404')) {
          logError(`Epoch ${epoch} not available (404), skipping`);
          epochsFailed++;
          continue;
        }
        logError(`Error fetching proposer duties for epoch ${epoch}:`, e);
        epochsFailed++;
        continue;
      }
    }

    logInfo(`Fetched proposer duties for ${epochsFetched} epochs; ${epochsFailed} epochs failed/skipped`);

    const filtered = duties.filter(d => d.slot >= startSlot && d.slot <= headSlot);

    const missedMap = new Map<string, number>();

    for (const { pubkey, slot } of filtered) {
      missedMap.set(pubkey, missedMap.get(pubkey) ?? 0);
      try {
        await fetchChainData<any>(
          chain.name,
          'rest',
          `/eth/v1/beacon/blocks/${slot}`,
        );
      } catch (e: any) {
        if (typeof e?.message === 'string' && e.message.includes('404')) {
          missedMap.set(pubkey, missedMap.get(pubkey)! + 1);
          continue;
        }
        logError(`Error fetching block ${slot} for pubkey ${pubkey}:`, e);
        continue;
      }
    }

    return Array.from(missedMap.entries()).map(([address, missed]) => ({
      address,
      missed_blocks_counter: missed.toString(),
    })) as SlashingSigningInfos[];

  } catch (e) {
    logError(`Error fetching missed blocks for ${chain.name}:`, e);
    return [];
  }
};

export default getMissedBlocks;
