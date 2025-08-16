import logger from '@/logger';
import { AddChainProps, GetCirculatingTokensPublic } from '@/server/tools/chains/chain-indexer';

const { logError } = logger('bostrom-circulating-tokens-public');

const getCirculatingTokensPublic: GetCirculatingTokensPublic = async (chain: AddChainProps) => {
  const response = await fetch('https://market-data.cybernode.ai/circulating_supply');
  const data = await response.json();

  if (!data) {
    logError(`Can't fetch public circulating supply for ${chain.name}`);
    return null;
  }
  return String(data).split('.')[0];
};

export default getCirculatingTokensPublic;
