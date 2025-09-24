import logger from '@/logger';
import { GetTvsFunction } from '@/server/tools/chains/chain-indexer';
import fetchSolanaData, { SolanaChainNode } from '@/server/tools/chains/solana/utils/fetch-solana-data';

const { logError, logDebug, logInfo } = logger('get-tvs-solana');

const getTvs: GetTvsFunction = async (chain) => {
  try {
    const supplyData = await fetchSolanaData<{ value: { total: string } }>('getSupply');
    const totalSupply = +supplyData.value.total;

    const currentVoteAccounts = await fetchSolanaData<{ current: SolanaChainNode[]; delinquent: SolanaChainNode[] }>(
      'getVoteAccounts',
    );
    const voteAccounts: SolanaChainNode[] = [...currentVoteAccounts.current, ...currentVoteAccounts.delinquent];
    let bondedTokens = 0;
    for (const va of voteAccounts) {
      bondedTokens += +va.activatedStake;
    }

    const unbondedTokens = 0;

    const tvs = parseFloat(bondedTokens.toString()) / parseFloat(totalSupply.toString());
    const unbondedTokensRatio = 0;

    logInfo(
      `TVS for [${chain.name}]: ${JSON.stringify({ totalSupply, bondedTokens, unbondedTokens, tvs, unbondedTokensRatio })}`,
    );

    return {
      totalSupply: totalSupply.toString(),
      bondedTokens: bondedTokens.toString(),
      unbondedTokens: '0',
      unbondedTokensRatio,
      tvs,
    };
  } catch (error) {
    logError(`Get TVS for [${chain.name}] error: `, error);
    return null;
  }
};

export default getTvs;
