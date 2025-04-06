import logger from '@/logger';
import { ChainTVLResult, GetTvlFunction } from '@/server/tools/chains/chain-indexer';
import fetchData from '@/server/utils/fetch-data';

const { logError, logDebug } = logger('get-tvl');

interface StakingData {
  address: string;
  totalSupply: string;
  effectiveSupply: string;
}

const getTvl: GetTvlFunction = async (chain) => {
  try {
    const indexerEndpoint = chain.nodes.find((node) => node.type === 'indexer')?.url;
    if (!indexerEndpoint) {
      logError(`RPC node for ${chain.name} chain not found`);
      return null;
    }

    let totalSupply = '0';
    let bondedTokens = '0';
    let tvl = 0;

    try {
      const stakingData: StakingData = await fetchData<StakingData>(
        `${indexerEndpoint}/api/v1/chain/token-supply?address=tnam1q9gr66cvu4hrzm0sd5kmlnjje82gs3xlfg3v6nu7`,
      );
      totalSupply = stakingData.totalSupply;
    } catch (error: any) {
      logError(`Get stakingData for [${chain.name}] error: `, error);
    }

    try {
      const votingPower = await fetchData<{ totalVotingPower: string }>(`${indexerEndpoint}/api/v1/pos/voting-power`);
      bondedTokens = (+votingPower.totalVotingPower * 1e6).toString();
      tvl = +bondedTokens / +totalSupply;
    } catch (error: any) {
      logError(`Get TVL for [${chain.name}] error: `, error);
    }

    const data: ChainTVLResult = {
      totalSupply: totalSupply.toString(),
      bondedTokens: bondedTokens.toString(),
      tvl,
      unbondedTokens: '0',
      unbondedTokensRatio: 0,
    };

    logDebug(`TVL for [${chain.name}]: ${JSON.stringify(data)}`);

    return data;
  } catch (error: any) {
    logError(`Get TVL for [${chain.name}] error: `, error);
    return null;
  }
};

export default getTvl;
