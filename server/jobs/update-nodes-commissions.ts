import db from '@/db';
import logger from '@/logger';
import { NodesCommissions } from '@/server/tools/chains/chain-indexer';
import getChainMethods from '@/server/tools/chains/methods';
import { getChainParams } from '@/server/tools/chains/params';

const { logError, logInfo } = logger('update-nodes-commissions');

const updateNodesCommissions = async (chainNames: string[]) => {
  for (const chainName of chainNames) {
    const chainParams = getChainParams(chainName);
    const chainMethods = getChainMethods(chainName);

    try {
      const dbChain = await db.chain.findFirst({
        where: { chainId: chainParams.chainId },
        include: {
          nodes: true,
        },
      });
      if (!dbChain) {
        logError(`Chain ${chainParams.chainId} not found in database`);
        continue;
      }
      logInfo(`${chainName} updating`);

      let nodesCommissions: NodesCommissions[] = [];

      if (dbChain.ecosystem === 'cosmos') {
        nodesCommissions = await chainMethods.getNodeCommissions(chainParams);
      } else {
        if (dbChain.nodes.length === 0) {
          logError(`Chain ${chainParams.chainId} doesn't have any nodes`);
          continue;
        }
        for (const node of dbChain.nodes) {
          if (!node.outstandingRewards || !node.rate) {
            continue;
          }
          const rewards = Number(node.outstandingRewards);
          const commission = rewards * Number(node.rate);
          nodesCommissions.push({
            address: node.operatorAddress,
            commission: String(commission),
          });
        }
      }

      for (const node of nodesCommissions) {
        if (node.commission && node.address) {
          await db.node.updateMany({
            where: { operatorAddress: node.address },
            data: { outstandingCommissions: node.commission },
          });
        }
      }
    } catch (e) {
      logError("Can't fetch nodes commission: ", e);
    }
  }
};

export default updateNodesCommissions;
