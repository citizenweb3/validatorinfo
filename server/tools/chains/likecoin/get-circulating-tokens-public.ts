import logger from '@/logger';
import { AddChainProps, GetCirculatingTokensPublic } from '@/server/tools/chains/chain-indexer';
import { bigIntPow } from '@/server/utils/bigint-pow';

const { logError } = logger('likecoin-circulating-tokens-public');

const getCirculatingTokensPublic: GetCirculatingTokensPublic = async (chain: AddChainProps) => {
  const response = await fetch('https://like.co/api/misc/totalsupply/likecoinchain');
  const data = await response.text();

  if (!data) {
    logError(`Can't fetch public circulating supply for ${chain.name}`);
    return null;
  }
  const circulatingTokens = BigInt(String(data).split('.')[0]);
  return String(circulatingTokens * bigIntPow(BigInt(10), BigInt(chain.coinDecimals)));
};

export default getCirculatingTokensPublic;
