import db from '@/db';
import logger from '@/logger';
import { getChainParams } from '@/server/tools/chains/params';
import { getTwitterFollowersAmount } from '@/server/tools/get-twitter-followers-amount';

const { logError, logInfo } = logger('update-twitter-followers-amount');

const updateTwitterFollowersAmount = async (chainNames: string[]) => {
  for (const chainName of chainNames) {
    const chainParams = getChainParams(chainName);

    try {
      const dbChain = await db.chain.findFirst({
        where: { chainId: chainParams.chainId },
      });
      if (!dbChain) {
        logError(`Chain ${chainParams.chainId} not found in database`);
        continue;
      }
      logInfo(`${chainName} updating`);
      const followers = await getTwitterFollowersAmount(dbChain.twitterUrl);
      logInfo(`${chainName} followers: ${followers}`);

      if (followers !== undefined && followers !== null) {
        await db.chain.update({
          where: { id: dbChain.id },
          data: {
            twitterFollowers: followers,
          },
        });
      }
    } catch (e) {
      logError("Can't fetch twitter followers: ", e);
    }
  }
};

export default updateTwitterFollowersAmount;
