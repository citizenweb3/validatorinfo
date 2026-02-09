import db from '@/db';
import logger from '@/logger';
import getChainMethods from '@/server/tools/chains/methods';
import { getChainParams } from '@/server/tools/chains/params';

const { logError, logInfo } = logger('update-reward-address');

const updateRewardAddress = async (chainNames: string[]) => {
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
      logInfo(`${chainName} updating reward addresses`);
      const rewardAddresses = await chainMethods.getRewardAddress(chainParams, dbChain.id);

      if (!rewardAddresses.length) {
        logInfo(`No reward addresses to update for ${chainName}`);
        continue;
      }

      logInfo(`Fetched ${rewardAddresses.length} reward addresses for ${chainName}`);

      let totalUpdated = 0;

      for (const address of rewardAddresses) {
        if (address.operatorAddress && address.rewardAddresses) {
          try {
            const result = await db.node.updateMany({
              where: { operatorAddress: address.operatorAddress },
              data: { rewardAddress: address.rewardAddresses },
            });
            totalUpdated += result.count;
          } catch (error: any) {
            logError(`Failed to update node ${address.operatorAddress}: ${error.message}`);
          }
        }
      }

      logInfo(`Updated ${totalUpdated} nodes for ${chainName}`);
    } catch (e: any) {
      logError(`Failed to update reward addresses for ${chainName}: ${e.message}`);
    }
  }
};

export default updateRewardAddress;
