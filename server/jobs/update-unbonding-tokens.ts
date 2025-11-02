import db from '@/db';
import logger from '@/logger';
import getChainMethods from '@/server/tools/chains/methods';
import { getChainParams } from '@/server/tools/chains/params';

const { logError, logInfo } = logger('update-unbonding-tokens');

const updateUnbondingTokens = async (chainNames: string[]) => {
  for (const chainName of chainNames) {
    const chainParams = getChainParams(chainName);
    const chainMethods = getChainMethods(chainName);

    try {
      const dbChain = await db.chain.findFirst({
        where: { chainId: chainParams.chainId },
      });

      if (!dbChain) {
        logError(`Chain ${chainParams.chainId} not found in database`);
        continue;
      }

      if (!dbChain.hasValidators) {
        logError(`${chainName} has no validators, skipping`);
        continue;
      }

      const unbondingTokens = await chainMethods.getUnbondingTokens(chainParams);

      if (unbondingTokens !== null && unbondingTokens !== undefined) {
        await db.tokenomics.upsert({
          where: { chainId: dbChain.id },
          update: { unbondingTokens },
          create: { chainId: dbChain.id, unbondingTokens },
        });

        logInfo(`${chainName} unbonding tokens updated successfully`);
      } else {
        logError(`${chainName} returned null/undefined unbonding tokens`);
      }
    } catch (e) {
      logError(`Can't fetch unbonding tokens for ${chainName}:`, e);
    }
  }
};

export default updateUnbondingTokens;
