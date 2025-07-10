import db from '@/db';
import logger from '@/logger';
import getChainMethods from '@/server/tools/chains/methods';
import { getChainParams } from '@/server/tools/chains/params';

const { logError, logInfo } = logger('update-nodes-rewards');

const updateNodesRewards = async (chainNames: string[]) => {
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
      const nodesRewards = await chainMethods.getNodeRewards(chainParams);
      logInfo(`${chainName} nodes rewards: ${nodesRewards}`);

      for (const node of nodesRewards) {
        if (node.rewards && node.address) {
          await db.node.update({
            where: { operatorAddress: node.address },
            data: { outstandingRewards: node.rewards },
          });
        }
      }
    } catch (e) {
      logError("Can't fetch nodes rewards: ", e);
    }
  }
};

export default updateNodesRewards;
