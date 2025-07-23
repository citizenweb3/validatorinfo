import db from '@/db';
import logger from '@/logger';
import getChainMethods from '@/server/tools/chains/methods';
import { getChainParams } from '@/server/tools/chains/params';

const { logError, logInfo } = logger('update-chain-rewards');

const updateChainRewards = async (chainNames: string[]) => {
  for (const chainName of chainNames) {
    const chainParams = getChainParams(chainName);
    const chainMethods = getChainMethods(chainName);

    try {
      const dbChain = await db.chain.findFirst({
        where: { chainId: chainParams.chainId },
      });
      if (!dbChain) {
        logError(`Chain ${chainParams.chainId} not found in database`);
        return null;
      }
      logInfo(`${chainName} updating`);
      const rewardsToPayout = await chainMethods.getChainRewards(chainParams);
      logInfo(`${chainName} chain rewards: ${rewardsToPayout}`);

      if (rewardsToPayout !== undefined && rewardsToPayout !== null) {
        await db.tokenomics.upsert({
          where: { chainId: dbChain.id },
          update: { rewardsToPayout },
          create: { chainId: dbChain.id, rewardsToPayout },
        });
      }
    } catch (e) {
      logError("Can't fetch chain rewards: ", e);
    }
  }
};

export default updateChainRewards;
