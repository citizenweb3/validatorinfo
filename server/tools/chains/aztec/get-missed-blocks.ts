import { getAddress } from 'viem';

import logger from '@/logger';
import { ValidatorsStatsResponse } from '@/server/tools/chains/aztec/get-nodes';
import { GetMissedBlocks } from '@/server/tools/chains/chain-indexer';
import { SlashingSigningInfos } from '@/server/types';
import { jsonRpcClientWithFailover } from '@/server/utils/json-rpc-client';

const { logError, logInfo } = logger('aztec-missed-blocks');

const getMissedBlocks: GetMissedBlocks = async (chain, dbChain) => {
  try {
    const rpcUrls = chain.nodes.filter((n: any) => n.type === 'rpc').map((n: any) => n.url);

    if (!rpcUrls.length) {
      throw new Error('No RPC URLs provided in chain configuration');
    }

    logInfo(`Fetching validator stats from ${rpcUrls.length} RPC endpoint(s)`);

    const response = await jsonRpcClientWithFailover<ValidatorsStatsResponse>(
      rpcUrls,
      'node_getValidatorsStats',
      [],
      'aztec-missed-blocks',
    );

    if (!response.stats || typeof response.stats !== 'object') {
      logError('Invalid response structure from node_getValidatorsStats', response.stats);
      return [];
    }

    const nodes = Object.values(response.stats);

    if (!nodes.length) {
      logError('No validators found in response');
      return [];
    }

    logInfo(`Processing ${nodes.length} validators`);

    const slashingInfos: SlashingSigningInfos[] = [];
    let skippedCount = 0;

    for (const node of nodes) {
      if (node.totalSlots === 0) {
        skippedCount++;
        continue;
      }

      const missedProposals = node.missedProposals.count ?? 0;
      const missedAttestations = node.missedAttestations.count ?? 0;

      const totalMissed = missedProposals + missedAttestations;

      slashingInfos.push({
        address: getAddress(node.address),
        missed_blocks_counter: String(totalMissed),
        total_slots: String(node.totalSlots),
      });
    }

    logInfo(
      `Successfully processed ${slashingInfos.length} validators with duties, skipped ${skippedCount} inactive validators`,
    );

    return slashingInfos;
  } catch (e) {
    logError(`Failed to fetch missed blocks for ${chain.name}:`, e);
    return [];
  }
};

export default getMissedBlocks;
