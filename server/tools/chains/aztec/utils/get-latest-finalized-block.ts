import logger from '@/logger';
import aztecIndexer, { AztecBlock } from '@/services/aztec-indexer-api';
import {
  AZTEC_INDEXER_MAX_BLOCK_RANGE,
  getAztecBlockHeight,
  getAztecTimestampMs,
  getUtcDayStart,
  isAztecFinalizedStatus,
} from '@/utils/aztec';

const { logWarn } = logger('aztec-latest-finalized-block');

const MAX_FINALIZED_LOOKBACK_WINDOWS = 50;

export class AztecIndexerUnavailableError extends Error {}

export const getLatestFinalizedBlock = async (): Promise<AztecBlock> => {
  const latestBlock = await aztecIndexer.getLatestBlockStrict({ cache: 'no-store' });
  const latestHeight = getAztecBlockHeight(latestBlock.height);

  let rangeEnd = latestHeight;

  for (let index = 0; index < MAX_FINALIZED_LOOKBACK_WINDOWS && rangeEnd >= 1; index++) {
    const from = Math.max(1, rangeEnd - AZTEC_INDEXER_MAX_BLOCK_RANGE + 1);
    const blocks = await aztecIndexer.getBlocksStrict({ from, to: rangeEnd }, { cache: 'no-store' });
    const latestFinalizedBlock = blocks.find((block) => isAztecFinalizedStatus(block.finalizationStatus));

    if (latestFinalizedBlock) {
      return latestFinalizedBlock;
    }

    rangeEnd = from - 1;
  }

  logWarn(`Unable to resolve finalized block near latest height ${latestHeight}`);
  throw new AztecIndexerUnavailableError(`Unable to resolve latest finalized Aztec block near height ${latestHeight}`);
};

export const getLatestFinalizedDayStart = async (): Promise<Date> => {
  const latestFinalizedBlock = await getLatestFinalizedBlock();
  return getUtcDayStart(getAztecTimestampMs(latestFinalizedBlock.header.globalVariables.timestamp));
};
