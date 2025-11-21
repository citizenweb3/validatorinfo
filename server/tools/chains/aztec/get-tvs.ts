import logger from '@/logger';
import { getL1 } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { getBondedTokens } from '@/server/tools/chains/aztec/utils/get-bonded-tokens';
import { getTotalSupply } from '@/server/tools/chains/aztec/utils/get-total-supply';
import { GetTvsFunction } from '@/server/tools/chains/chain-indexer';
import { getChainParams } from '@/server/tools/chains/params';

const { logError, logInfo, logWarn } = logger('get-tvs-aztec');

const getTvs: GetTvsFunction = async (chain) => {
  try {
    const l1Chain = getChainParams(getL1[chain.name]);
    const l1RpcUrls = l1Chain.nodes.filter((n: any) => n.type === 'rpc').map((n: any) => n.url);

    if (!l1RpcUrls.length) {
      logError('No L1 RPC URLs found - stake data will not be available');
    }

    let totalSupply: bigint | null = null;
    let bondedTokens: bigint | null = null;
    let tvs: number = 0;

    if (l1RpcUrls.length > 0) {
      try {
        totalSupply = await getTotalSupply(l1RpcUrls, chain.name as 'aztec' | 'aztec-testnet');
      } catch (e: any) {
        logWarn(`Failed to fetch total supply: ${e.message}`);
      }
      try {
        bondedTokens = await getBondedTokens(l1RpcUrls, chain.name as 'aztec' | 'aztec-testnet');
      } catch (e: any) {
        logWarn(`Failed to fetch total supply: ${e.message}`);
      }

      if (bondedTokens !== null && totalSupply !== null) {
        tvs = Number(bondedTokens) / Number(totalSupply);
      }
    }

    const result = {
      totalSupply: totalSupply !== null ? String(totalSupply) : '',
      bondedTokens: bondedTokens !== null ? String(bondedTokens) : '',
      unbondedTokens: '0',
      unbondedTokensRatio: 0,
      tvs: tvs,
    };

    logInfo(`TVS for [${chain.name}]: ${JSON.stringify(result)}`);
    return result;
  } catch (err) {
    logError(`Get TVS for [${chain.name}] error:`, err);
    return null;
  }
};

export default getTvs;
