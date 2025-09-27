import db from '@/db';
import logger from '@/logger';
import getChainMethods from '@/server/tools/chains/methods';
import { getChainParams } from '@/server/tools/chains/params';

const { logError, logInfo } = logger('update-delegators-amount');

const updateDelegatorsAmount = async (chainNames: string[]) => {
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

      const delegatorsAmount = await chainMethods.getDelegatorsAmount(chainParams);

      if (!delegatorsAmount || delegatorsAmount.length === 0) {
        logError(`Chain ${chainParams.chainId}: could not find delegators`);
      }

      for (const node of delegatorsAmount) {
        await db.node.updateMany({
          where: { operatorAddress: node.address },
          data: { delegatorsAmount: node.amount },
        });
      }
    } catch (e) {
      logError("Can't fetch delegators amount: ", e);
    }
  }
};

export default updateDelegatorsAmount;
