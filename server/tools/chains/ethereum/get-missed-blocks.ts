import logger from '@/logger';
import { GetMissedBlocks } from '@/server/tools/chains/chain-indexer';
import { SlashingSigningInfos } from '@/server/types';

const { logError } = logger('eth-missed-blocks');

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
    const headerUrl = `${restUrl}/eth/v1/beacon/headers/head`;
    const headerResponse = await fetch(headerUrl);

    let headerJson: any = null;
    try {
      headerJson = await headerResponse.clone().json();
    } catch(e) {
      logError(`Error with header JSON for chain ${chain.name}: ${e}`);
    }
    if (!headerResponse.ok) throw new Error(`HTTP ${headerResponse.status} ${headerResponse.statusText}`);

    const slotStr =
      headerJson?.data?.header?.message?.slot ??
      headerJson?.data?.header?.slot ??
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
    for (let epoch = startEpoch; epoch <= currentEpoch; epoch++) {
      const url = `${restUrl}/eth/v1/validator/duties/proposer/${epoch}`;
      const dutiesResponse = await fetch(url);

      if (dutiesResponse.status === 404) {
        logError(`Epoch ${epoch} not available (404), skipping`);
        continue;
      }
      if (!dutiesResponse.ok) throw new Error(`HTTP ${dutiesResponse.status} ${dutiesResponse.statusText}`);

      const dutiesJson = await dutiesResponse.json();
      duties.push(...dutiesJson.data);
    }

    const filtered = duties.filter(d => d.slot >= startSlot && d.slot <= headSlot);

    const missedMap = new Map<string, number>();

    for (const { pubkey, slot } of filtered) {
      missedMap.set(pubkey, missedMap.get(pubkey) ?? 0);

      const blockUrl = `${restUrl}/eth/v1/beacon/blocks/${slot}`;
      const blockResponse = await fetch(blockUrl);

      if (blockResponse.status === 404) {
        missedMap.set(pubkey, missedMap.get(pubkey)! + 1);
        continue;
      }
      if (!blockResponse.ok) throw new Error(`HTTP ${blockResponse.status} ${blockResponse.statusText}`);
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
