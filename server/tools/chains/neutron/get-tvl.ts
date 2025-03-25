import logger from '@/logger';
import { GetTvlFunction } from '@/server/tools/chains/chain-indexer';
import fetchData from '@/server/utils/fetch-data';

const { logError } = logger('get-tvl');

interface BankBalancesResponse {
  balances: {
    denom: string;
    amount: string;
  }[];
}

const getTvl: GetTvlFunction = async (chain) => {
  try {
    let totalSupply = '0';
    let bondedTokens = '0';
    let unbondedTokens = '0';
    let tvl = 0;
    let unbondedTokensRatio = 0;

    const lcdEndpoint = chain.nodes.find((node) => node.type === 'lcd')?.url;
    if (!lcdEndpoint) {
      logError(`LCD node for ${chain.name} chain not found`);
      return null;
    }

    try {
      const response = await fetchData<{ supply: { denom: string; amount: string }[] }>(
        `${lcdEndpoint}/cosmos/bank/v1beta1/supply?pagination.limit=100000`,
      );

      totalSupply = response.supply.find((supply) => supply.denom === chain.minimalDenom)?.amount || '0';
    } catch (e) {
      logError(`Get total supply for [${chain.name}] error: `, e);
    }

    const contractAddress = 'neutron1qeyjez6a9dwlghf9d6cy44fxmsajztw257586akk6xn6k88x0gus5djz4e';

    try {
      const url = `${lcdEndpoint}/cosmos/bank/v1beta1/balances/${contractAddress}`;
      const response = await fetchData<BankBalancesResponse>(url);
      bondedTokens = response.balances.find((b) => b.denom === chain.minimalDenom)?.amount || '0';
    } catch (error) {
      console.error('Error querying locked tokens:', error);
    }

    tvl = +bondedTokens / +totalSupply;

    return {
      totalSupply,
      bondedTokens,
      unbondedTokens,
      unbondedTokensRatio,
      tvl,
    };
  } catch (error: any) {
    logError(`Get TVL for [${chain.name}] error: `, error);
    return null;
  }
};

export default getTvl;
