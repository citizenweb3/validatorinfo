import aztecIndexer from '@/services/aztec-indexer-api';
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

const getBlocksByChainName = async (
  chainName: string,
  currentPage: number = 1,
  perPage: number = 10,
): Promise<BlocksResponse> => {
  const normalizedChainName = chainName.toLowerCase();

  if (normalizedChainName === 'aztec') {
    return getAztecBlocks(currentPage, perPage);
  }

  return { blocks: [], totalPages: 1 };
};

const BlocksService = {
  getBlocksByChainName,
  getAztecBlocks,
};

export default BlocksService;
