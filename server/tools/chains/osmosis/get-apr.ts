import logger from '@/logger';
import { GetAprFunction } from '@/server/tools/chains/chain-indexer';
import fetchChainData from '@/server/tools/get-chain-data';

const { logError } = logger('osmosis-apr');

export const getApr: GetAprFunction = async (chain) => {
  try {
    const epochProvisionsResponse = await fetchChainData<{ epoch_provisions: string }>(
      chain.name,
      'rest',
      `/osmosis/mint/v1beta1/epoch_provisions`,
    );
    const currentEpochProvisions = parseFloat(epochProvisionsResponse.epoch_provisions) / 10 ** chain.coinDecimals;

    const mintParamsResponse = await fetchChainData<{ params: { distribution_proportions: { staking: string } } }>(
      chain.name,
      'rest',
      `/osmosis/mint/v1beta1/params`,
    );
    const stakingProportion = parseFloat(mintParamsResponse.params.distribution_proportions.staking);

    const stakingPoolResponse = await fetchChainData<{ pool: { bonded_tokens: string } }>(
      chain.name,
      'rest',
      `/cosmos/staking/v1beta1/pool`,
    );
    const bondedTokens = parseFloat(stakingPoolResponse.pool.bonded_tokens) / 10 ** chain.coinDecimals;

    const distributionParamsResponse = await fetchChainData<{ params: { community_tax: string } }>(
      chain.name,
      'rest',
      `/cosmos/distribution/v1beta1/params`,
    );
    const communityTax = parseFloat(distributionParamsResponse.params.community_tax);

    const annualProvisions = currentEpochProvisions * stakingProportion * 365;

    return (annualProvisions * (1 - communityTax)) / bondedTokens;
  } catch (e) {
    logError(`${chain.name} Can't fetch APR: `, e);
    return 0;
  }
};

export default getApr;
