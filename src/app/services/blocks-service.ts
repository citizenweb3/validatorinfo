import aztecIndexer from '@/services/aztec-indexer-api';
import cosmosIndexer from '@/services/cosmos-indexer-api';
import logosIndexer from '@/services/logos-indexer-api';
import { formatTimestamp } from '@/utils/format-timestamp';
import {
  AZTEC_INDEXER_MAX_BLOCK_RANGE,
  getAztecBlockHeight,
  getAztecTimestampMs,
} from '@/utils/aztec';

export interface BlockItem {
  hash: string;
  height: string | number;
  timestamp: string;
  finalizationStatus: number;
}

export interface BlocksResponse {
  blocks: BlockItem[];
  totalPages: number;
}

const getAztecBlocks = async (currentPage: number, perPage: number): Promise<BlocksResponse> => {
  try {
    const pageSize = Math.max(1, Math.min(perPage, AZTEC_INDEXER_MAX_BLOCK_RANGE));
    const latestBlock = await aztecIndexer.getLatestBlock({ cache: 'no-store' });

    if (!latestBlock) {
      return { blocks: [], totalPages: 1 };
    }

    const latestHeight = getAztecBlockHeight(latestBlock.height);
    const totalPages = Math.ceil(latestHeight / pageSize);
    const upperBlock = latestHeight - (currentPage - 1) * pageSize;
    const from = Math.max(1, upperBlock - pageSize + 1);

    const aztecBlocks = await aztecIndexer.getUiBlocks({ from, to: upperBlock }, { cache: 'no-store' });

    const blocks: BlockItem[] = aztecBlocks.map((block) => {
      const timestamp = new Date(getAztecTimestampMs(block.timestamp));
      const formattedTimestamp = formatTimestamp(timestamp);

      return {
        hash: block.blockHash,
        height: block.height,
        timestamp: formattedTimestamp,
        finalizationStatus: block.blockStatus,
      };
    });

    return { blocks, totalPages };
  } catch (error) {
    console.error('Failed to fetch Aztec blocks:', error);
    return { blocks: [], totalPages: 1 };
  }
};

const LOGOS_MAX_PER_PAGE = 100;

const getLogosBlocks = async (currentPage: number, perPage: number): Promise<BlocksResponse> => {
  try {
    const pageSize = Math.max(1, Math.min(perPage, LOGOS_MAX_PER_PAGE));
    const stats = await logosIndexer.getStats({ cache: 'no-store' });
    const totalBlocks = stats.total_blocks;

    if (!totalBlocks || totalBlocks <= 0) {
      return { blocks: [], totalPages: 1 };
    }

    const computedFromStats = Math.max(1, Math.ceil(totalBlocks / pageSize));
    const offset = (currentPage - 1) * pageSize;
    const { data, pagination } = await logosIndexer.getBlocks(
      { finalized: 'all', limit: pageSize, offset },
      { cache: 'no-store' },
    );

    const computedFromHasMore = pagination.has_more ? currentPage + 1 : currentPage;
    const totalPages = Math.max(computedFromStats, computedFromHasMore);

    // Indexer API does not preserve slot ordering across the dataset; sort the
    // current page by slot desc so within-page rows look chronologically correct.
    const sorted = [...data].sort((a, b) => b.slot - a.slot);
    const blocks: BlockItem[] = sorted.map((b) => ({
      hash: b.id,
      // height is null until finalization on Cryptarchia — fall back to slot so the
      // column is never empty (slot is unique-and-monotonic per block).
      height: b.height ?? b.slot,
      timestamp: formatTimestamp(new Date(b.indexed_at)),
      finalizationStatus: b.finalized ? 3 : 0,
    }));

    return { blocks, totalPages };
  } catch (error) {
    console.error('Failed to fetch Logos blocks:', error);
    return { blocks: [], totalPages: 1 };
  }
};

const COSMOS_MAX_PER_PAGE = 100;

const getCosmosBlocks = async (currentPage: number, perPage: number): Promise<BlocksResponse> => {
  try {
    const pageSize = Math.max(1, Math.min(perPage, COSMOS_MAX_PER_PAGE));
    const stats = await cosmosIndexer.getBlocksStats({ cache: 'no-store' });
    const lastHeight = BigInt(stats.data.last_height);

    if (lastHeight <= BigInt(0)) {
      return { blocks: [], totalPages: 1 };
    }

    const totalPages = Math.max(1, Math.ceil(Number(lastHeight) / pageSize));
    const offset = BigInt((currentPage - 1) * pageSize);
    const beforeHeightBig = lastHeight - offset + BigInt(1);

    if (beforeHeightBig <= BigInt(1)) {
      return { blocks: [], totalPages };
    }

    const { data } = await cosmosIndexer.getBlocksList(
      { limit: pageSize, before_height: beforeHeightBig.toString() },
      { cache: 'no-store' },
    );

    const blocks: BlockItem[] = data.map((b) => ({
      hash: b.block_hash,
      height: b.height,
      timestamp: formatTimestamp(new Date(b.time)),
      // Tendermint provides instant finality once a block is committed.
      finalizationStatus: 3,
    }));

    return { blocks, totalPages };
  } catch (error) {
    console.error('Failed to fetch Cosmos blocks:', error);
    return { blocks: [], totalPages: 1 };
  }
};

const getBlocksByChainName = async (
  chainName: string,
  currentPage: number = 1,
  perPage: number = 10,
): Promise<BlocksResponse> => {
  const normalizedChainName = chainName.toLowerCase();

  if (normalizedChainName === 'aztec') {
    return getAztecBlocks(currentPage, perPage);
  }

  if (normalizedChainName === 'logos-testnet') {
    return getLogosBlocks(currentPage, perPage);
  }

  if (normalizedChainName === 'cosmoshub') {
    return getCosmosBlocks(currentPage, perPage);
  }

  return { blocks: [], totalPages: 1 };
};

const BlocksService = {
  getBlocksByChainName,
  getAztecBlocks,
  getLogosBlocks,
  getCosmosBlocks,
};

export default BlocksService;
