/**
 * @deprecated This method is no longer used for fetching current TVS.
 * Current TVS data is synced from time series table (ChainTvsHistory) by:
 * - server/jobs/update-aztec-tvs-history.ts
 *
 * The job calculates daily TVS and syncs the latest value to tokenomics table.
 * Kept for reference and potential fallback.
 */

import logger from '@/logger';
import { AztecChainName } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { getBondedTokens } from '@/server/tools/chains/aztec/utils/get-bonded-tokens';
import { getTotalSupply } from '@/server/tools/chains/aztec/utils/get-total-supply';
import { GetTvsFunction } from '@/server/tools/chains/chain-indexer';

const { logError, logInfo } = logger('get-tvs-aztec');

const getTvs: GetTvsFunction = async (chain) => {
  try {
    let totalSupply: bigint | null = null;
    let bondedTokens: bigint | null = null;
    let tvs: number = 0;

    try {
      totalSupply = await getTotalSupply(chain.name as AztecChainName);
    } catch (e: any) {
      logError(`[${chain.name}] Failed to fetch total supply: ${e.message}`);
    }
    try {
      bondedTokens = await getBondedTokens(chain);
    } catch (e: any) {
      logError(`[${chain.name}] Failed to fetch bonded tokens: ${e.message}`);
    }

    if (bondedTokens !== null && totalSupply !== null) {
      tvs = Number(bondedTokens) / Number(totalSupply);
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
