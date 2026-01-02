import { Abi } from 'viem';

import logger from '@/logger';
import { contracts, getL1, rollupAbis } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import getCurrentEpoch from '@/server/tools/chains/aztec/utils/get-current-epoch';
import { getChainParams } from '@/server/tools/chains/params';
import { createViemClientWithFailover } from '@/server/utils/viem-client-with-failover';

const { logError } = logger('aztec-prover-rewards');

export const getTotalProverRewards = async (chainName: string): Promise<bigint | null> => {
  try {
    const l1Chain = getChainParams(getL1[chainName]);
    const l1RpcUrls = l1Chain.nodes.filter((n: any) => n.type === 'rpc').map((n: any) => n.url);

    if (!l1RpcUrls.length) {
      logError(`${chainName}: No L1 RPC URLs found for prover rewards`);
      return null;
    }

    const client = createViemClientWithFailover(l1RpcUrls, {
      loggerName: `${chainName}-apr-prover-rewards`,
    });

    const rollupAddress = contracts[chainName as 'aztec' | 'aztec-testnet'].rollupAddress as `0x${string}`;
    const rollupAbi = rollupAbis[chainName as 'aztec' | 'aztec-testnet'] as Abi;

    const currentEpoch = await getCurrentEpoch(chainName);

    if (!currentEpoch || currentEpoch === BigInt(0)) {
      logError(`${chainName}: No current Epoch found`);
      return null;
    }

    let totalProverRewards = BigInt(0);

    for (let epoch = BigInt(0); epoch <= currentEpoch; epoch++) {
      try {
        const epochRewards = (await client.readContract({
          address: rollupAddress,
          abi: rollupAbi,
          functionName: 'getCollectiveProverRewardsForEpoch',
          args: [epoch],
        })) as bigint;

        totalProverRewards += epochRewards;
      } catch (error: any) {
        logError(`${chainName}: Failed to fetch prover rewards for epoch ${epoch}: ${error.message}`);
      }
    }
    return totalProverRewards;
  } catch (error: any) {
    logError(`${chainName}: Failed to fetch prover rewards: ${error.message}`);
    return null;
  }
};
