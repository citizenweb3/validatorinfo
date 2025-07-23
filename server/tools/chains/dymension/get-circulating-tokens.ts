import logger from '@/logger';
import { AddChainProps, GetCirculatingTokens } from '@/server/tools/chains/chain-indexer';
import { bigIntPow } from '@/server/utils/bigint-pow';

const { logError } = logger('dymension-circulating-tokens');

const getCirculatingTokens: GetCirculatingTokens = async (
  chain: AddChainProps,
  totalSupply?: string,
  communityPool?: string,
) => {
  const response = await fetch('https://fetchcirculatingsupply-xqbg2swtrq-uc.a.run.app/?networkId=dymension_1100-1');
  const data = await response.json();

  if (!data) {
    logError(`No circulating supply for ${chain.name}`);
    return null;
  }
  const circulatingTokens = BigInt(String(data).split('.')[0]);
  return String(circulatingTokens * bigIntPow(BigInt(10), BigInt(chain.coinDecimals)));
};

export default getCirculatingTokens;
