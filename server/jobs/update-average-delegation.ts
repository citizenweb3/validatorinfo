import db from '@/db';
import logger from '@/logger';
import { getChainParams } from '@/server/tools/chains/params';

const { logError, logInfo } = logger('update-average-delegation');

const updateAverageDelegation = async (chainNames: string[]) => {
  for (const chainName of chainNames) {
    const chainParams = getChainParams(chainName);

    try {
      const dbChain = await db.chain.findFirst({
        where: { chainId: chainParams.chainId },
        include: {
          params: true,
          tokenomics: true,
        },
      });

      if (!dbChain) {
        logError(`Chain ${chainParams.chainId} not found in database`);
        continue;
      }

      const decimals = dbChain?.params?.coinDecimals;

      if (decimals == null) {
        logError(`Skip average delegation for chain ${chainParams.name}: missing decimals`);
        continue;
      }

      const nodes = await db.node.findMany({
        where: {
          chainId: dbChain.id,
          delegatorsAmount: { gt: 0 },
        },
        select: {
          delegatorShares: true,
          delegatorsAmount: true,
        },
      });

      if (!nodes || nodes.length === 0) {
        logError(`Skip average delegation for chain ${chainParams.name}: no validators found`);
        continue;
      }

      let totalTokens = BigInt(0);
      let totalDelegators = 0;

      for (const node of nodes) {
        try {
          const nodeTokens = BigInt(node.delegatorShares);
          const nodeDelegators = node.delegatorsAmount || 0;

          totalTokens += nodeTokens;
          totalDelegators += nodeDelegators;
        } catch (e) {
          logError(`Error parsing tokens for node in chain ${chainParams.name}:`, e);
          continue;
        }
      }

      if (totalDelegators === 0) {
        logError(`Skip average delegation for chain ${chainParams.name}: total delegators is 0`);
        continue;
      }

      const averageDelegation = (totalTokens / BigInt(totalDelegators)).toString();

      await db.tokenomics.upsert({
        where: { chainId: dbChain.id },
        update: { averageDelegation: averageDelegation },
        create: {
          chainId: dbChain.id,
          averageDelegation: averageDelegation,
        },
      });

      logInfo(`${chainName}: Successfully updated average delegation`);
    } catch (e) {
      logError(`Can't update average delegation for chain ${chainParams.name}:`, e);
    }
  }
};

export default updateAverageDelegation;
