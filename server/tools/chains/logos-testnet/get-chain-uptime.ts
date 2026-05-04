import { Chain } from '@prisma/client';

import logger from '@/logger';
import { GetChainUptime } from '@/server/tools/chains/chain-indexer';
import { LogosBlocksResponse, LogosStats } from '@/server/tools/chains/logos-testnet/types';
import { getChainParams } from '@/server/tools/chains/params';

const { logError, logWarn } = logger('logos-chain-uptime');

const FALLBACK_SLOT_DURATION_MS = 2000;
const SAMPLE_LIMIT = 100;
const REQUEST_TIMEOUT_MS = 8000;

interface BlockSample {
  slot: number;
  height: number | null;
  indexed_at: string;
}

const computeMedianMs = (
  blocks: BlockSample[],
  keyField: 'slot' | 'height',
): number | null => {
  const samples: number[] = [];
  for (let i = 0; i < blocks.length - 1; i++) {
    const a = blocks[i];
    const b = blocks[i + 1];
    const aKey = a[keyField];
    const bKey = b[keyField];
    if (typeof aKey !== 'number' || typeof bKey !== 'number') continue;
    const dtMs = new Date(a.indexed_at).getTime() - new Date(b.indexed_at).getTime();
    const dKey = aKey - bKey;
    if (Number.isFinite(dtMs) && Number.isFinite(dKey) && dKey > 0 && dtMs > 0) {
      samples.push(dtMs / dKey);
    }
  }
  if (samples.length === 0) return null;
  samples.sort((a, b) => a - b);
  const mid = Math.floor(samples.length / 2);
  return samples.length % 2 === 0 ? (samples[mid - 1] + samples[mid]) / 2 : samples[mid];
};

const getChainUptime: GetChainUptime = async (dbChain: Chain) => {
  const token = process.env.LOGOS_INDEXER_API_TOKEN;

  if (!token) {
    logWarn(`${dbChain.name} - LOGOS_INDEXER_API_TOKEN not set, skipping uptime fetch`);
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const params = getChainParams(dbChain.name);
    const indexerUrl = params.nodes.find((n) => n.type === 'indexer')?.url;

    if (!indexerUrl) {
      logError(`${dbChain.name} - no indexer URL in params.ts nodes`);
      return null;
    }

    const res = await fetch(`${indexerUrl}/api/v1/stats`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    });

    if (!res.ok) {
      logError(`${dbChain.name} - indexer /api/v1/stats returned ${res.status}`);
      return null;
    }

    const stats = (await res.json()) as LogosStats;

    if (!Number.isFinite(stats.node_height) || stats.node_height < 0) {
      logError(`${dbChain.name} - invalid node_height in stats; response keys: ${Object.keys(stats).join(',')}`);
      return null;
    }

    let slotDurationMs: number = FALLBACK_SLOT_DURATION_MS;
    let blockTimeMs: number | null = null;
    try {
      const blocksRes = await fetch(
        `${indexerUrl}/api/v1/blocks?limit=${SAMPLE_LIMIT}&order=desc&sort=slot`,
        {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        },
      );
      if (blocksRes.ok) {
        const blocksJson = (await blocksRes.json()) as LogosBlocksResponse;
        const blocks = blocksJson.data ?? [];
        const computedSlot = computeMedianMs(blocks, 'slot');
        const computedBlock = computeMedianMs(blocks, 'height');
        if (computedSlot !== null && computedSlot > 0) {
          slotDurationMs = computedSlot;
        } else {
          logWarn(`${dbChain.name} - slot duration sampling produced no valid samples, using fallback`);
        }
        if (computedBlock !== null && computedBlock > 0) {
          blockTimeMs = computedBlock;
        } else {
          logWarn(`${dbChain.name} - block time sampling produced no valid samples`);
        }
      } else {
        logWarn(`${dbChain.name} - blocks endpoint returned ${blocksRes.status}, using fallback slot duration`);
      }
    } catch (e) {
      logWarn(`${dbChain.name} - blocks sampling failed, using fallback: ${(e as Error).message}`);
    }

    return {
      lastUptimeUpdated: new Date(),
      uptimeHeight: stats.node_height,
      avgTxInterval: slotDurationMs,
      blockTime: blockTimeMs,
    };
  } catch (e) {
    logError(`${dbChain.name} - fetch /api/v1/stats failed`, e);
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

export default getChainUptime;
