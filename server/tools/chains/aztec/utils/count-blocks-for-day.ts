import logger from '@/logger';
import aztecIndexer, { AztecBlock } from '@/services/aztec-indexer-api';
import {
  AztecIndexerUnavailableError,
  getLatestFinalizedBlock,
} from '@/server/tools/chains/aztec/utils/get-latest-finalized-block';
import { getAztecBlockHeight, getAztecTimestampMs, getUtcDayStart } from '@/utils/aztec';

const { logInfo } = logger('count-blocks-for-day-aztec');

interface CountBlocksForDayOptions {
  latestFinalizedBlock?: AztecBlock;
}

const getBlockTimestampSeconds = (block: AztecBlock): number => {
  return Math.floor(getAztecTimestampMs(block.header.globalVariables.timestamp) / 1000);
};

export const countBlocksForDay = async (targetDate: Date, options: CountBlocksForDayOptions = {}): Promise<number> => {
  const dateStr = targetDate.toISOString().split('T')[0];
  const dayStart = new Date(dateStr + 'T00:00:00.000Z');
  const dayEnd = new Date(dateStr + 'T23:59:59.999Z');

  const startTs = Math.floor(dayStart.getTime() / 1000);
  const endTs = Math.floor(dayEnd.getTime() / 1000);

  const latestFinalizedBlock = options.latestFinalizedBlock ?? await getLatestFinalizedBlock();
  const latestIndexedDay = getUtcDayStart(getAztecTimestampMs(latestFinalizedBlock.header.globalVariables.timestamp));

  if (dayStart.getTime() > latestIndexedDay.getTime()) {
    throw new AztecIndexerUnavailableError(
      `Latest finalized Aztec block only covers ${latestIndexedDay.toISOString().split('T')[0]}`,
    );
  }

  const latestHeight = getAztecBlockHeight(latestFinalizedBlock.height);

  let low = 1;
  let high = latestHeight;
  let firstBlockInDay = -1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const block = await aztecIndexer.getBlockByHeightStrict(mid, { cache: 'no-store' });
    const blockTs = getBlockTimestampSeconds(block);

    if (blockTs >= startTs) {
      firstBlockInDay = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  if (firstBlockInDay === -1) {
    return 0;
  }

  while (firstBlockInDay > 1) {
    const prevBlock = await aztecIndexer.getBlockByHeightStrict(firstBlockInDay - 1, { cache: 'no-store' });
    const prevTs = getBlockTimestampSeconds(prevBlock);

    if (prevTs >= startTs) {
      firstBlockInDay--;
      continue;
    }

    break;
  }

  low = firstBlockInDay;
  high = latestHeight;
  let lastBlockInDay = -1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const block = await aztecIndexer.getBlockByHeightStrict(mid, { cache: 'no-store' });
    const blockTs = getBlockTimestampSeconds(block);

    if (blockTs <= endTs) {
      lastBlockInDay = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  if (lastBlockInDay === -1 || lastBlockInDay < firstBlockInDay) {
    return 0;
  }

  while (lastBlockInDay < latestHeight) {
    const nextBlock = await aztecIndexer.getBlockByHeightStrict(lastBlockInDay + 1, { cache: 'no-store' });
    const nextTs = getBlockTimestampSeconds(nextBlock);

    if (nextTs <= endTs) {
      lastBlockInDay++;
      continue;
    }

    break;
  }

  const count = lastBlockInDay - firstBlockInDay + 1;
  logInfo(`${targetDate.toISOString().split('T')[0]}: blocks ${firstBlockInDay}-${lastBlockInDay} (${count} total)`);

  return count;
};
