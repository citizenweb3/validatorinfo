import logger from '@/logger';
import aztecIndexer from '@/services/aztec-indexer-api';

const { logInfo } = logger('count-blocks-for-day-aztec');

export const countBlocksForDay = async (targetDate: Date): Promise<number> => {
  // Use UTC to ensure consistent results across timezones
  const dateStr = targetDate.toISOString().split('T')[0];
  const dayStart = new Date(dateStr + 'T00:00:00.000Z');
  const dayEnd = new Date(dateStr + 'T23:59:59.999Z');

  const startTs = Math.floor(dayStart.getTime() / 1000);
  const endTs = Math.floor(dayEnd.getTime() / 1000);

  const latestHeight = await aztecIndexer.getLatestHeight();
  if (latestHeight === 0) return 0;

  let low = 1;
  let high = latestHeight;
  let firstBlockInDay = -1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const block = await aztecIndexer.getBlockByHeight(mid);
    if (!block) {
      low = mid + 1;
      continue;
    }

    const blockTs = Math.floor(Number(block.header.globalVariables.timestamp) / 1000);

    if (blockTs >= startTs) {
      firstBlockInDay = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  if (firstBlockInDay === -1) return 0;

  while (firstBlockInDay > 1) {
    const prevBlock = await aztecIndexer.getBlockByHeight(firstBlockInDay - 1);
    if (!prevBlock) break;
    const prevTs = Math.floor(Number(prevBlock.header.globalVariables.timestamp) / 1000);
    if (prevTs >= startTs) {
      firstBlockInDay--;
    } else {
      break;
    }
  }

  low = firstBlockInDay;
  high = latestHeight;
  let lastBlockInDay = -1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const block = await aztecIndexer.getBlockByHeight(mid);
    if (!block) {
      high = mid - 1;
      continue;
    }

    const blockTs = Math.floor(Number(block.header.globalVariables.timestamp) / 1000);

    if (blockTs <= endTs) {
      lastBlockInDay = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  if (lastBlockInDay === -1 || lastBlockInDay < firstBlockInDay) return 0;

  while (lastBlockInDay < latestHeight) {
    const nextBlock = await aztecIndexer.getBlockByHeight(lastBlockInDay + 1);
    if (!nextBlock) break;
    const nextTs = Math.floor(Number(nextBlock.header.globalVariables.timestamp) / 1000);
    if (nextTs <= endTs) {
      lastBlockInDay++;
    } else {
      break;
    }
  }

  const count = lastBlockInDay - firstBlockInDay + 1;
  logInfo(`${targetDate.toISOString().split('T')[0]}: blocks ${firstBlockInDay}-${lastBlockInDay} (${count} total)`);

  return count;
};
