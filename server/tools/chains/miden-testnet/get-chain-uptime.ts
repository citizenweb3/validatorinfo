import { Chain } from '@prisma/client';

import logger from '@/logger';
import { GetChainUptime } from '@/server/tools/chains/chain-indexer';
import midenIndexer, { MidenBlock } from '@/services/miden-indexer-api';

const { logError, logWarn } = logger('miden-chain-uptime');

const FALLBACK_BLOCK_TIME_MS = 1000;
const SAMPLE_LIMIT = 100;
const REQUEST_TIMEOUT_MS = 8000;

const computeMedianBlockTimeMs = (blocks: MidenBlock[]): number | null => {
  const samples: number[] = [];
  for (let i = 0; i < blocks.length - 1; i++) {
    const a = blocks[i];
    const b = blocks[i + 1];
    const aNum = Number(a.block_num);
    const bNum = Number(b.block_num);
    if (!Number.isFinite(aNum) || !Number.isFinite(bNum)) continue;
    const dtMs = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    const dNum = aNum - bNum;
    if (Number.isFinite(dtMs) && Number.isFinite(dNum) && dNum !== 0 && dtMs !== 0) {
      samples.push(Math.abs(dtMs / dNum));
    }
  }
  if (samples.length === 0) return null;
  samples.sort((a, b) => a - b);
  const mid = Math.floor(samples.length / 2);
  return samples.length % 2 === 0 ? (samples[mid - 1] + samples[mid]) / 2 : samples[mid];
};

const getChainUptime: GetChainUptime = async (dbChain: Chain) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    let stats;
    try {
      stats = await midenIndexer.getStats({ cache: 'no-store', signal: controller.signal });
    } catch (e) {
      logError(`${dbChain.name} - getStats failed`, e);
      return null;
    }

    const uptimeHeight = Number(stats.last_block);

    if (!Number.isFinite(uptimeHeight) || uptimeHeight <= 0 || !stats.last_block) {
      logError(`${dbChain.name} - invalid last_block in stats; response keys: ${Object.keys(stats).join(',')}`);
      return null;
    }

    let slotDurationMs: number = FALLBACK_BLOCK_TIME_MS;
    let blockTimeMs: number | null = null;
    try {
      const blocksJson = await midenIndexer.getBlocks(
        { limit: SAMPLE_LIMIT, offset: 0, sort: 'block_num', order: 'desc' },
        { cache: 'no-store', signal: controller.signal },
      );
      const blocks = blocksJson.data ?? [];
      const computed = computeMedianBlockTimeMs(blocks);
      if (computed !== null && computed > 0) {
        slotDurationMs = computed;
        blockTimeMs = computed;
      } else {
        logWarn(`${dbChain.name} - block time sampling produced no valid samples, using fallback for avgTxInterval`);
      }
    } catch (e) {
      logWarn(`${dbChain.name} - getBlocks sampling failed, using fallback for avgTxInterval: ${(e as Error).message}`);
    }

    return {
      lastUptimeUpdated: new Date(),
      uptimeHeight,
      avgTxInterval: slotDurationMs,
      blockTime: blockTimeMs,
    };
  } finally {
    clearTimeout(timeout);
  }
};

export default getChainUptime;
