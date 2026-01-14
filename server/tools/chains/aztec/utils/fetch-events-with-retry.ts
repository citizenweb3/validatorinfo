import { Abi, PublicClient } from 'viem';

import logger from '@/logger';

import { isBlockRangeTooLargeError, MIN_CHUNK_SIZE } from './get-chunck-size-rpc';

const { logInfo, logWarn, logError } = logger('fetch-events-with-retry');

interface FetchEventsParams {
  client: PublicClient;
  contractAddress: `0x${string}`;
  abi: Abi;
  eventName: string;
  fromBlock: bigint;
  toBlock: bigint;
  initialChunkSize: number;
  chainName: string;
}

interface FetchEventsResult {
  events: any[];
  failedRanges: Array<{ start: string; end: string }>;
}

export const fetchEventsWithAdaptiveRetry = async ({
  client,
  contractAddress,
  abi,
  eventName,
  fromBlock,
  toBlock,
  initialChunkSize,
  chainName,
}: FetchEventsParams): Promise<FetchEventsResult> => {
  const allEvents: any[] = [];
  const failedRanges: Array<{ start: string; end: string }> = [];

  const queue: Array<[bigint, bigint, number]> = [];

  for (let start = fromBlock; start < toBlock; start += BigInt(initialChunkSize)) {
    const end = start + BigInt(initialChunkSize) > toBlock ? toBlock : start + BigInt(initialChunkSize);
    queue.push([start, end, initialChunkSize]);
  }

  while (queue.length > 0) {
    const [rangeStart, rangeEnd, currentChunkSize] = queue.shift()!;

    try {
      const events = await client.getContractEvents({
        address: contractAddress,
        abi,
        eventName,
        fromBlock: rangeStart,
        toBlock: rangeEnd,
      });

      allEvents.push(...events);

      if (events.length > 0) {
        logInfo(`${chainName}: Fetched ${events.length} ${eventName} events from blocks ${rangeStart}-${rangeEnd}`);
      }
    } catch (error: any) {
      if (isBlockRangeTooLargeError(error) && currentChunkSize > MIN_CHUNK_SIZE) {
        const newChunkSize = Math.floor(currentChunkSize / 2);
        const midBlock = rangeStart + BigInt(Math.floor(Number(rangeEnd - rangeStart) / 2));

        logWarn(
          `${chainName}: Block range ${rangeStart}-${rangeEnd} too large, splitting (chunk ${currentChunkSize} -> ${newChunkSize})`,
        );

        queue.unshift([midBlock, rangeEnd, newChunkSize]);
        queue.unshift([rangeStart, midBlock, newChunkSize]);
      } else {
        logError(
          `${chainName}: Failed to fetch ${eventName} events for blocks ${rangeStart}-${rangeEnd}: ${error.message}`,
        );
        failedRanges.push({ start: rangeStart.toString(), end: rangeEnd.toString() });
      }
    }
  }

  return { events: allEvents, failedRanges };
};
