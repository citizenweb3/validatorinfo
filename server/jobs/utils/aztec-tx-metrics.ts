import aztecIndexer from '@/services/aztec-indexer-api';
import { getLatestFinalizedBlock } from '@/server/tools/chains/aztec/utils/get-latest-finalized-block';
import { AZTEC_INDEXER_MAX_BLOCK_RANGE, getAztecBlockHeight, getAztecTimestampMs } from '@/utils/aztec';

const TPS_BLOCK_WINDOW = AZTEC_INDEXER_MAX_BLOCK_RANGE;

export const toBigIntValue = (value: string | number | bigint): bigint => {
  if (typeof value === 'bigint') {
    return value;
  }

  if (typeof value === 'number') {
    return BigInt(Math.trunc(value));
  }

  return BigInt(value);
};

/**
 * Computes average transaction fee over the latest UI tx-effects batch.
 * Reads raw transactionFee values from the indexer UI endpoint and averages
 * them locally (we do not trust the indexer's /stats/average-fees aggregate).
 *
 * FIX: previous implementation passed `{ cache: 'no-store' }` as the first
 * positional argument to `getTxEffects`, which is the query-params slot.
 * Correct call is `getUiTxEffects(params?, options?)`. Also drops the
 * `!tx.isOrphaned` filter — `getUiTxEffects` already returns confirmed tx
 * effects only.
 *
 * Errors bubble up — the job's `Promise.allSettled` handles them.
 */
export const calculateAztecAverageFee = async (): Promise<string | null> => {
  const batch = await aztecIndexer.getUiTxEffects({}, { cache: 'no-store' });

  if (batch.length === 0) {
    return null;
  }

  const totalFees = batch.reduce((sum, tx) => sum + toBigIntValue(tx.transactionFee), BigInt(0));

  return (totalFees / BigInt(batch.length)).toString();
};

/**
 * Computes TPS over the last AZTEC_INDEXER_MAX_BLOCK_RANGE finalized blocks.
 * The window ends at `latestFinalizedHeight` (inclusive), so every block in
 * [latestFinalizedHeight - (WINDOW - 1) .. latestFinalizedHeight] is finalized
 * by construction — no explicit finalization filter is required.
 *
 * FIX: previous code filtered by `isAztecFinalizedStatus(block.blockStatus)`.
 * The UI blocks endpoint lags on `blockStatus` in v4 alpha, which caused the
 * filter to drop every block and return null. The [from, to] window is
 * already bounded above by `latestFinalizedHeight`, so filtering is redundant.
 *
 * Errors bubble up — the job's `Promise.allSettled` handles them.
 */
export const calculateAztecTps = async (): Promise<number | null> => {
  const latestFinalizedBlock = await getLatestFinalizedBlock();
  const latestFinalizedHeight = getAztecBlockHeight(latestFinalizedBlock.height);
  const from = Math.max(1, latestFinalizedHeight - TPS_BLOCK_WINDOW + 1);

  const recentBlocks = await aztecIndexer.getUiBlocksStrict({ from, to: latestFinalizedHeight }, { cache: 'no-store' });

  const sortedBlocks = recentBlocks.slice().sort((left, right) => Number(left.height) - Number(right.height));

  if (sortedBlocks.length === 0) {
    return null;
  }

  const totalTxs = sortedBlocks.reduce((sum, block) => sum + Number(block.txEffectsLength || 0), 0);

  if (sortedBlocks.length === 1) {
    return totalTxs;
  }

  const firstTimestamp = getAztecTimestampMs(sortedBlocks[0].timestamp);
  const lastTimestamp = getAztecTimestampMs(sortedBlocks[sortedBlocks.length - 1].timestamp);
  const elapsedSeconds = Math.max((lastTimestamp - firstTimestamp) / 1000, 1);

  return totalTxs / elapsedSeconds;
};
