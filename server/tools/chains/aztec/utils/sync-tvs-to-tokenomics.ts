import db from '@/db';
import logger from '@/logger';
import { getUnbondedTokens } from '@/server/tools/chains/aztec/utils/get-unbonded-tokens';
import { getUnbondingTokens } from '@/server/tools/chains/aztec/utils/get-unbonding-tokens';

const { logInfo, logError } = logger('sync-aztec-tvs');

const TVS_PERCENTAGE_TO_DECIMAL = 100;

export const syncTvsToTokenomics = async (chainId: number, chainName: string): Promise<void> => {
  try {
    const lastRecord = await db.chainTvsHistory.findFirst({
      where: { chainId },
      orderBy: { date: 'desc' },
    });

    if (!lastRecord) {
      throw new Error(`${chainName}: No TVS history records found - cannot sync to tokenomics`);
    }

    const [unbondedTokens, unbondingTokens] = await Promise.all([
      getUnbondedTokens(chainId),
      getUnbondingTokens(chainId),
    ]);

    const totalSupplyBigInt = BigInt(lastRecord.totalSupply || '0');
    const unbondedTokensRatio =
      totalSupplyBigInt > 0 ? Number(unbondedTokens) / Number(totalSupplyBigInt) : 0;

    await db.tokenomics.upsert({
      where: { chainId },
      update: {
        tvs: lastRecord.tvs / TVS_PERCENTAGE_TO_DECIMAL,
        bondedTokens: lastRecord.totalStaked,
        totalSupply: lastRecord.totalSupply,
        unbondedTokens: String(unbondedTokens),
        unbondedTokensRatio,
        unbondingTokens: String(unbondingTokens),
      },
      create: {
        chainId,
        tvs: lastRecord.tvs / TVS_PERCENTAGE_TO_DECIMAL,
        bondedTokens: lastRecord.totalStaked,
        totalSupply: lastRecord.totalSupply,
        unbondedTokens: String(unbondedTokens),
        unbondedTokensRatio,
        unbondingTokens: String(unbondingTokens),
      },
    });

    logInfo(
      `${chainName}: Synced TVS ${lastRecord.tvs.toFixed(2)}%, unbonded ${unbondedTokens}, unbonding ${unbondingTokens} to tokenomics`,
    );
  } catch (error: any) {
    logError(`${chainName}: Failed to sync TVS to tokenomics: ${error.message}`);
    throw error;
  }
};
