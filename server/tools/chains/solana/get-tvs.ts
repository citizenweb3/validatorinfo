import logger from '@/logger';
import { GetTvsFunction } from '@/server/tools/chains/chain-indexer';
import { jsonRpcClientWithFailover } from '@/server/utils/json-rpc-client';

const { logError, logDebug, logInfo } = logger('get-tvs-solana');

interface SolanaChainNode {
  activatedStake: number;
  commission: number;
  epochCredits: any;
  epochVoteAccount: boolean;
  lastVote: number;
  nodePubkey: string;
  rootSlot: number;
  votePubkey: string;
}

const getTvs: GetTvsFunction = async (chain) => {
  try {
    const rpcUrls = chain.nodes.filter((n: any) => n.type === 'rpc').map((n: any) => n.url);
    if (!rpcUrls.length) {
      throw new Error('No RPC URLs provided in chain object');
    }

    const supplyData = await jsonRpcClientWithFailover<{ value: { total: string } }>(
      rpcUrls,
      'getSupply',
      undefined,
      'get-tvs-solana'
    );
    const totalSupply = +supplyData.value.total;

    const currentVoteAccounts = await jsonRpcClientWithFailover<{
      current: SolanaChainNode[];
      delinquent: SolanaChainNode[];
    }>(rpcUrls, 'getVoteAccounts', undefined, 'get-tvs-solana');
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
