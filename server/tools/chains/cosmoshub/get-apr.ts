import logger from '@/logger';
import { GetAprFunction } from '@/server/tools/chains/chain-indexer';
import fetchChainData from '@/server/tools/get-chain-data';

const { logError, logWarn } = logger('cosmos-apr');

const getApr: GetAprFunction = async (chain) => {
  try {
    let annualProvisions = 0;
    let communityTax = 0;
    let bondedTokens = 0;
    let apr: number;

    try {
      annualProvisions = await fetchChainData<{ annual_provisions: string }>(
        chain.name,
        'rest',
        `/cosmos/mint/v1beta1/annual_provisions`,
      ).then((data) => Number(data.annual_provisions) || 0);
    } catch (e) {
      logError(`${chain.name} Can't fetch communityTax: `, e);
    }

    try {
      communityTax = await fetchChainData<{ params: { community_tax: string } }>(
        chain.name,
        'rest',
        `/cosmos/distribution/v1beta1/params`,
      ).then((data) => Number(data.params.community_tax) || 0);
    } catch (e) {
      logError(`${chain.name} Can't fetch communityTax: `, e);
    }

    try {
      bondedTokens = await fetchChainData<{ pool: { bonded_tokens: string } }>(
        chain.name,
        'rest',
        `/cosmos/staking/v1beta1/pool`,
      ).then((data) => Number(data.pool.bonded_tokens) || 0);
    } catch (e) {
      logError(`${chain.name} Can't fetch bondedTokens: `, e);
    }

    apr = (annualProvisions * (1 - communityTax)) / bondedTokens;

    if (!apr) {
      logWarn(
        `${chain.name} apr: ${apr}, annualProvisions: ${annualProvisions}, communityTax: ${communityTax}, bondedTokens: ${bondedTokens}`,
      );
    }

    return apr;
  } catch (e) {
    logError(`${chain.name} Can't fetch APR: `, e);
    return 0;
  }
};

export default getApr;
