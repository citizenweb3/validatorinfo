import db from '@/db';
import logger from '@/logger';
import { GetRewardAddress, RewardAddress } from '@/server/tools/chains/chain-indexer';
import fetchChainData from '@/server/tools/get-chain-data';

const { logError } = logger('cosmos-reward-address');

const getRewardAddress: GetRewardAddress = async (chain, dbChainId) => {
  try {
    const nodes = await db.node.findMany({
      where: { chainId: dbChainId },
    });

    if (nodes.length > 0) {
      let rewardsAddresses: RewardAddress[] = [];
      for (const node of nodes) {
        const response = await fetchChainData<{
          withdraw_address: string;
        }>(chain.name, 'rest', `/cosmos/distribution/v1beta1/delegators/${node.accountAddress}/withdraw_address`);
        if (response.withdraw_address && response.withdraw_address !== '') {
          rewardsAddresses.push({
            operatorAddress: node.operatorAddress,
            rewardAddresses: response.withdraw_address,
          });
        }
      }
      return rewardsAddresses;
    } else {
      logError(`Nodes not found for ${chain.name}`);
      return [];
    }
  } catch (e) {
    logError(`${chain.name} Can't fetch reward addresses: `, e);
    return [];
  }
};

export default getRewardAddress;
