import logger from '@/logger';
import { GetTvsFunction } from '@/server/tools/chains/chain-indexer';
import fetchChainData from '@/server/tools/get-chain-data';

const { logError } = logger('get-tvs');

interface BankBalancesResponse {
  balances: {
    denom: string;
    amount: string;
  }[];
}

const getTvs: GetTvsFunction = async (chain) => {
  try {
    let totalSupply = '0';
    let bondedTokens = '0';
    let unbondedTokens = '0';
    let tvs = 0;
    let unbondedTokensRatio = 0;

    try {
      const response = await fetchChainData<{ supply: { denom: string; amount: string }[] }>(
        chain.name,
        'rest',
        `/cosmos/bank/v1beta1/supply?pagination.limit=100000`,
      );

      totalSupply = response.supply.find((supply) => supply.denom === chain.minimalDenom)?.amount || '0';
    } catch (e) {
      logError(`Get total supply for [${chain.name}] error: `, e);
    }

    const contractAddress = 'neutron1qeyjez6a9dwlghf9d6cy44fxmsajztw257586akk6xn6k88x0gus5djz4e';

    try {
      const url = `/cosmos/bank/v1beta1/balances/${contractAddress}`;
      const response = await fetchChainData<BankBalancesResponse>(chain.name, 'rest', url);
      bondedTokens = response.balances.find((b) => b.denom === chain.minimalDenom)?.amount || '0';
    } catch (error) {
      console.error('Error querying locked tokens:', error);
    }

    tvs = +bondedTokens / +totalSupply;

    return {
      totalSupply,
      bondedTokens,
      unbondedTokens,
      unbondedTokensRatio,
      tvs,
    };
  } catch (error: any) {
    logError(`Get TVL for [${chain.name}] error: `, error);
    return null;
  }
};

export default getTvs;
