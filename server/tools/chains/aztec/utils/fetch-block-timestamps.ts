import logger from '@/logger';
import { createViemClientWithFailover } from '@/server/utils/viem-client-with-failover';

const { logError } = logger('fetch-block-timestamps');

const BATCH_SIZE = 10;

export const fetchBlockTimestamps = async (
  client: ReturnType<typeof createViemClientWithFailover>,
  blockNumbers: bigint[],
): Promise<Map<string, Date>> => {
  const uniqueBlocks = Array.from(new Set(blockNumbers.map((b) => b.toString())));
  const timestampCache = new Map<string, Date>();

  for (let i = 0; i < uniqueBlocks.length; i += BATCH_SIZE) {
    const batch = uniqueBlocks.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map((blockNumber) => client.getBlock({ blockNumber: BigInt(blockNumber) })),
    );

    results.forEach((result, index) => {
      const blockNumber = batch[index];
      if (result.status === 'fulfilled') {
        timestampCache.set(blockNumber, new Date(Number(result.value.timestamp) * 1000));
      } else {
        logError(`Failed to fetch block ${blockNumber}: ${result.reason?.message || 'Unknown error'}`);
      }
    });
  }

  return timestampCache;
};
