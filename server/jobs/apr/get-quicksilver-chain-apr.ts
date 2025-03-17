import db from '@/db';
import logger from '@/logger';

import { ChainWithNodes } from '../../types';

const { logError, logInfo } = logger('get-chain-apr');

export const getQuicksilverChainApr = async (chain: ChainWithNodes) => {
  try {
    const lcdEndpoint = chain.chainNodes.find((node) => node.type === 'lcd')?.url;
    if (!lcdEndpoint) {
      logError(`LCD node for ${chain.name} chain not found`);
      return 0;
    }

    let apr = 0;

    const epochProvisionsResponse = await fetch(`${lcdEndpoint}/quicksilver/mint/v1beta1/epoch_provisions`).then(
      (data) => data.json(),
    );

    const currentEpochProvisions = parseFloat(epochProvisionsResponse.epoch_provisions) / 10 ** chain.coinDecimals;

    const mintParamsResponse = await fetch(`${lcdEndpoint}/quicksilver/mint/v1beta1/params`).then((data) =>
      data.json(),
    );

    const stakingProportion = parseFloat(mintParamsResponse.params.distribution_proportions.staking);

    const stakingPoolResponse = await fetch(`${lcdEndpoint}/cosmos/staking/v1beta1/pool`).then((data) => data.json());
    const bondedTokens = parseFloat(stakingPoolResponse.pool.bonded_tokens) / 10 ** chain.coinDecimals;

    const distributionParamsResponse = await fetch(`${lcdEndpoint}/cosmos/distribution/v1beta1/params`).then((data) =>
      data.json(),
    );
    const communityTax = parseFloat(distributionParamsResponse.params.community_tax);

    const annualProvisions = currentEpochProvisions * stakingProportion * 365;

    apr = (annualProvisions * (1 - communityTax)) / bondedTokens;

    logInfo(`${chain.prettyName} APR: ${apr}`);

    await db.chain.update({
      where: { id: chain.id },
      data: { apr },
    });
  } catch (e) {
    logError(`${chain.name} Can't fetch APR: `, e);
  }
};

export default getQuicksilverChainApr;
