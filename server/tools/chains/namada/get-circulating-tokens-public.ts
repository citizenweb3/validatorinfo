import logger from '@/logger';
import { AddChainProps, GetCirculatingTokensPublic } from '@/server/tools/chains/chain-indexer';
import fetchChainData from '@/server/tools/get-chain-data';

const { logError } = logger('namada-circulating-tokens');

const getCirculatingTokensPublic: GetCirculatingTokensPublic = async (chain: AddChainProps) => {
  const response = await fetchChainData<{ circulatingSupply: string }>(
    chain.name,
    'indexer',
    '/api/v1/chain/circulating-supply',
  );
  if (!response?.circulatingSupply) {
    logError(`No circulating supply for ${chain.name}`);
    return null;
  }
  return String(response.circulatingSupply);
};

export default getCirculatingTokensPublic;
