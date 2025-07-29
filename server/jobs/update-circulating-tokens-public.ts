import db from '@/db';
import logger from '@/logger';
import getChainMethods from '@/server/tools/chains/methods';
import { getChainParams } from '@/server/tools/chains/params';

const { logError, logInfo } = logger('update-circulating-tokens-public');

const updateCirculatingTokensPublic = async (chainNames: string[]) => {
  for (const chainName of chainNames) {
    const chainParams = getChainParams(chainName);
    const chainMethods = getChainMethods(chainName);

    try {
      const dbChain = await db.chain.findFirst({
        where: { chainId: chainParams.chainId },
        include: {
          tokenomics: true,
        },
      });
      if (!dbChain) {
        logError(`Chain ${chainParams.chainId} not found in database`);
        continue;
      }
      logInfo(`${chainName} updating`);
      const circulatingTokens = await chainMethods.getCirculatingTokensPublic(chainParams);
      logInfo(`${chainName} circulating tokens: ${circulatingTokens}`);

      if (circulatingTokens !== undefined && circulatingTokens !== null) {
        await db.tokenomics.upsert({
          where: { chainId: dbChain.id },
          update: { circulatingTokensPublic: circulatingTokens },
          create: { chainId: dbChain.id, circulatingTokensPublic: circulatingTokens },
        });
      }
    } catch (e) {
      logError(`Can't fetch circulating tokens for ${chainName}: `, e);
    }
  }
};

export default updateCirculatingTokensPublic;
