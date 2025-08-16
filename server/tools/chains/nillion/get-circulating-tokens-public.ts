import logger from '@/logger';
import { AddChainProps, GetCirculatingTokensPublic } from '@/server/tools/chains/chain-indexer';
import { bigIntPow } from '@/server/utils/bigint-pow';

const { logError } = logger('nillion-circulating-tokens-public');

const getCirculatingTokensPublic: GetCirculatingTokensPublic = async (chain: AddChainProps) => {
  const response = await fetch('https://nillion.market/api/supply/circulating/nil');
  const data = await response.json();

  if (!data) {
    logError(`Can't fetch public circulating supply for ${chain.name}`);
    return null;
  }
  const circulatingTokens = BigInt(String(data.result).split('.')[0]);
  return String(circulatingTokens * bigIntPow(BigInt(10), BigInt(chain.coinDecimals)));
};

export default getCirculatingTokensPublic;
