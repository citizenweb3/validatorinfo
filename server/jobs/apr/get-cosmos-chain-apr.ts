import db from '@/db';
import logger from '@/logger';

import { ChainWithNodes } from '../../types';

const { logError, logInfo } = logger('get-cosmos-chain-apr');

export const getCosmosChainApr = async (chain: ChainWithNodes) => {
  try {
    const lcdEndpoint = chain.chainNodes.find((node) => node.type === 'lcd')?.url;
    if (!lcdEndpoint) {
      logError(`LCD node for ${chain.name} chain not found`);
      return 0;
    }

    let annualProvisions = 0;
    let communityTax = 0;
    let bondedTokens = 0;
    let apr = 0;

    annualProvisions = await fetch(`${lcdEndpoint}/cosmos/mint/v1beta1/annual_provisions`)
      .then((data) => data.json())
      .then((data) => Number(data.annual_provisions));

    try {
      communityTax = await fetch(`${lcdEndpoint}/cosmos/distribution/v1beta1/params`)
        .then((data) => data.json())
        .then((data) => Number(data.params.community_tax));
    } catch (e) {
      logError(`${chain.name} Can't fetch communityTax: `, e);
    }

    try {
      bondedTokens = await fetch(`${lcdEndpoint}/cosmos/staking/v1beta1/pool`)
        .then((data) => data.json())
        .then((data) => Number(data.pool.bonded_tokens));
    } catch (e) {
      logError(`${chain.name} Can't fetch bondedTokens: `, e);
    }

    apr = (annualProvisions * (1 - communityTax)) / bondedTokens;

    if (!apr) {
      console.log(chain.prettyName, `src/providers/validators/CosmosValidatorClass.ts:173`, {
        apr,
        bondedTokens,
        communityTax,
        annualProvisions,
      });
    }

    logInfo(`${chain.prettyName} APR: ${apr}`);

    await db.chain.update({
      where: { id: chain.id },
      data: { apr },
    });

    // return (annualProvisions * (1 - communityTax)) / bondedTokens;
  } catch (e) {
    logError(`${chain.name} Can't fetch APR: `, e);
  }
};

export default getCosmosChainApr;
