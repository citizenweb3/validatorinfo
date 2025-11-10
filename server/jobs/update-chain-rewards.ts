import db from '@/db';
import logger from '@/logger';
import { getChainParams } from '@/server/tools/chains/params';

const { logError, logInfo } = logger('update-chain-rewards');

const updateChainRewards = async (chainNames: string[]) => {
  for (const chainName of chainNames) {
    const chainParams = getChainParams(chainName);

    try {
      const dbChain = await db.chain.findFirst({
        where: { chainId: chainParams.chainId },
        include: {
          nodes: true,
        },
      });
      if (!dbChain) {
        logError(`Chain ${chainParams.chainId} not found in database`);
        return null;
      }
      logInfo(`${chainName} updating`);

      if (dbChain.nodes.length === 0) {
        logError(`Chain ${chainParams.chainId} doesn't have nodes`);
        continue;
      }

      let rewardsToPayout = BigInt(0);

      for (const node of dbChain.nodes) {
        if (!node.outstandingRewards) {
          continue;
        }
        rewardsToPayout += BigInt(String(node.outstandingRewards).split('.')[0]);
      }

      const rewardsToPayoutStr = String(rewardsToPayout);

      logInfo(`${chainName} chain rewards: ${rewardsToPayout}`);

      await db.tokenomics.upsert({
        where: { chainId: dbChain.id },
        update: { rewardsToPayout: rewardsToPayoutStr },
        create: { chainId: dbChain.id, rewardsToPayout: rewardsToPayoutStr },
      });
    } catch (e) {
      logError("Can't fetch chain rewards: ", e);
    }
  }
};

export default updateChainRewards;
