import logger from '@/logger';
import { GetNodesVotes, NodeVote } from '@/server/tools/chains/chain-indexer';
import fetchChainData from '@/server/tools/get-chain-data';

const { logError } = logger('namada-nodes-votes');

const getNodesVotes: GetNodesVotes = async (chain, address) => {
  try {
    return await fetchChainData<NodeVote[]>(
      chain.name,
      'indexer',
      `/api/v1/gov/voter/${address}/votes`,
    );
  } catch (e) {
    logError(`${chain.name} Can't fetch nodes votes: `, e);
    return [];
  }
};

export default getNodesVotes;
