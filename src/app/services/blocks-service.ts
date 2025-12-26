import aztecIndexer from '@/services/aztec-indexer-api';
import { formatTimestamp } from '@/utils/format-timestamp';

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
    const latestHeight = await aztecIndexer.getLatestHeight({ cache: 'no-store' });
    const totalPages = Math.ceil(latestHeight / perPage);
    const from = Math.max(1, latestHeight - currentPage * perPage + 1);
    const upperBlock = latestHeight - (currentPage - 1) * perPage;

    const aztecBlocks = await aztecIndexer.getBlocks({ from, limit: perPage }, { cache: 'no-store' });

    const filteredBlocks = aztecBlocks.filter((block) => {
      const height = typeof block.height === 'string' ? parseInt(block.height, 10) : block.height;
      return height <= upperBlock;
    });

    const blocks: BlockItem[] = filteredBlocks.map((block) => {
      const timestamp = new Date(block.header.globalVariables.timestamp);
      const formattedTimestamp = formatTimestamp(timestamp);

      return {
        hash: block.hash,
        height: block.height,
        timestamp: formattedTimestamp,
        finalizationStatus: block.finalizationStatus,
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
