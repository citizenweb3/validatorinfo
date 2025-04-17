import logger from '@/logger';
import { ChainTVSResult, GetTvsFunction } from '@/server/tools/chains/chain-indexer';
import fetchData from '@/server/utils/fetch-data';

const { logError, logDebug } = logger('get-tvl');

interface StakingData {
  amount: {
    amount: string;
    denom: string;
  };
}

const getTvs: GetTvsFunction = async (chain) => {
  try {
    const indexerEndpoint = chain.nodes.find((node) => node.type === 'lcd')?.url;
    if (!indexerEndpoint) {
      logError(`RPC node for ${chain.name} chain not found`);
      return null;
    }

    let totalSupply = '0';
    let bondedTokens = '0';
    let unbondedTokens = '0';
    let unbondedTokensRatio = 0;
    let tvs = 0;

    try {
      const stakingData: StakingData = await fetchData<StakingData>(
        `${indexerEndpoint}/cosmos/bank/v1beta1/supply/unom`,
      );
      totalSupply = stakingData.amount.amount;
    } catch (error: any) {
      logError(`Get stakingData for [${chain.name}] error: `, error);
    }

    try {
      const pool = await fetchData<{ pool: { bonded_tokens: string; not_bonded_tokens: string } }>(
        `${indexerEndpoint}/cosmos/staking/v1beta1/pool`,
      );
      bondedTokens = (+pool.pool.bonded_tokens).toString();
      unbondedTokens = (+pool.pool.not_bonded_tokens).toString();
      tvs = +bondedTokens / +totalSupply;
      unbondedTokensRatio = +unbondedTokens / +totalSupply;
    } catch (error: any) {
      logError(`Get TVL for [${chain.name}] error: `, error);
    }

    const result: ChainTVSResult = {
      totalSupply: totalSupply.toString(),
      bondedTokens: bondedTokens.toString(),
      unbondedTokens: unbondedTokens.toString(),
      unbondedTokensRatio,
      tvs,
    };

    logDebug(`TVS for [${chain.name}]: ${JSON.stringify(result)}`);

    return result;
  } catch (error: any) {
    logError(`Get TVS for [${chain.name}] error: `, error);
    return null;
  }
};

export default getTvs;
