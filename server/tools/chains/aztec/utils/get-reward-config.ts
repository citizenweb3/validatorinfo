import logger from '@/logger';
import { contracts, getL1, rollupAbis } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { getChainParams } from '@/server/tools/chains/params';
import { getOrCreateViemClient } from '@/server/utils/viem-client-with-failover';

const { logInfo } = logger('get-reward-config-aztec');

export interface RewardConfig {
  blockReward: bigint;
  sequencerBps: bigint;
}

interface RewardConfigResult {
  rewardDistributor: `0x${string}`;
  sequencerBps: number;
  booster: `0x${string}`;
  blockReward: bigint;
}

export const getRewardConfig = async (chainName: 'aztec' | 'aztec-testnet'): Promise<RewardConfig> => {
  const l1ChainName = getL1[chainName];
  const l1Chain = getChainParams(l1ChainName);
  const l1RpcUrls = l1Chain.nodes.filter((n: any) => n.type === 'rpc').map((n: any) => n.url);

  const client = getOrCreateViemClient(l1RpcUrls, 'reward-config');
  const contractConfig = contracts[chainName];
  const abi = rollupAbis[chainName];

  const config = (await client.readContract({
    address: contractConfig.rollupAddress as `0x${string}`,
    abi,
    functionName: 'getRewardConfig',
  })) as RewardConfigResult;

  const result = {
    sequencerBps: BigInt(config.sequencerBps),
    blockReward: config.blockReward,
  };

  logInfo(`${chainName}: blockReward=${result.blockReward}, sequencerBps=${result.sequencerBps}`);

  return result;
};
