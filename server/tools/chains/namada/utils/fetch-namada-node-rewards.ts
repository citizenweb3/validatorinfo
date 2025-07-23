import logger from '@/logger';
import { AddChainProps } from '@/server/tools/chains/chain-indexer';
import fetchChainData from '@/server/tools/get-chain-data';

const { logError } = logger('namada-fetch-node-rewards');

const fetchNamadaNodeRewards = async (chain: AddChainProps, address: string): Promise<string | null> => {
  const url = `/api/v1/pos/reward/${address}`;

  try {
    const response = await fetchChainData<{ minDenomAmount: string }[]>(chain.name, 'indexer', url);

    if (!Array.isArray(response) || response.length === 0 || !response[0]?.minDenomAmount) {
      logError(`Empty or invalid rewards response for ${chain.name}, address ${address}`, response);
      return null;
    }

    return response[0].minDenomAmount;
  } catch (e) {
    logError(`Can't fetch rewards: ${chain.name}, address: ${address}, error: ${e}`);
    return null;
  }
};

export default fetchNamadaNodeRewards;
