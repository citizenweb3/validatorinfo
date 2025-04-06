import logger from '@/logger';
import { GetAprFunction } from '@/server/tools/chains/chain-indexer';

const { logError } = logger('osmosis-apr');

export const getApr: GetAprFunction = async (chain) => {
  try {
    const lcdEndpoint = chain.nodes.find((node) => node.type === 'lcd')?.url;
    if (!lcdEndpoint) {
      logError(`LCD node for ${chain.name} chain not found`);
      return 0;
    }

    const epochProvisionsResponse = await fetch(`${lcdEndpoint}/osmosis/mint/v1beta1/epoch_provisions`).then((data) =>
      data.json(),
    );
    const currentEpochProvisions = parseFloat(epochProvisionsResponse.epoch_provisions) / 10 ** chain.coinDecimals;

    const mintParamsResponse = await fetch(`${lcdEndpoint}/osmosis/mint/v1beta1/params`).then((data) => data.json());
    const stakingProportion = parseFloat(mintParamsResponse.params.distribution_proportions.staking);

    const stakingPoolResponse = await fetch(`${lcdEndpoint}/cosmos/staking/v1beta1/pool`).then((data) => data.json());
    const bondedTokens = parseFloat(stakingPoolResponse.pool.bonded_tokens) / 10 ** chain.coinDecimals;

    const distributionParamsResponse = await fetch(`${lcdEndpoint}/cosmos/distribution/v1beta1/params`).then((data) =>
      data.json(),
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
