import { Abi } from 'viem';

import logger from '@/logger';
import {
  AztecChainName,
  contracts,
  stakingRegistryAbis,
} from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { readContractWithFailover } from '@/server/utils/viem-client-with-failover';

export interface ProviderConfig {
  providerIdentifier: bigint;
  providerAdmin: string;
  providerTakeRate: number;
  providerRewardsRecipient: string;
}

export const getProviders = async (
  rpcUrls: string[],
  chainName: AztecChainName,
): Promise<Map<bigint, ProviderConfig>> => {
  const { logInfo, logError } = logger(`${chainName}-get-providers`);

  if (rpcUrls.length === 0) {
    return new Map();
  }

  const contractAddress = contracts[chainName].stakingRegistryAddress;
  const abi = stakingRegistryAbis[chainName] as Abi;

  try {
    const nextProviderId = await readContractWithFailover<bigint>(
      rpcUrls,
      {
        address: contractAddress as `0x${string}`,
        abi: abi,
        functionName: 'nextProviderIdentifier',
        args: [],
      },
      `${chainName}-providers-count`,
    );

    logInfo(`nextProviderIdentifier is ${nextProviderId}, fetching providers 1 to ${nextProviderId - BigInt(1)}`);

    const providers = new Map<bigint, ProviderConfig>();

    for (let i = BigInt(1); i < nextProviderId; i++) {
      try {
        const config = await readContractWithFailover<[string, number, string]>(
          rpcUrls,
          {
            address: contractAddress as `0x${string}`,
            abi: abi,
            functionName: 'providerConfigurations',
            args: [i],
          },
          `${chainName}-provider-${i}`,
        );

        providers.set(i, {
          providerIdentifier: i,
          providerAdmin: config[0],
          providerTakeRate: config[1],
          providerRewardsRecipient: config[2],
        });
      } catch (e: any) {
        logError(`Failed to fetch provider ${i}: ${e.message}`);
        continue;
      }
    }

    logInfo(`Successfully fetched ${providers.size} provider configurations`);
    return providers;
  } catch (e: any) {
    logError(`Failed to fetch providers: ${e.message}`);
    return new Map();
  }
};
