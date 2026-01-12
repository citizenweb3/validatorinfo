import { Abi } from 'viem';

import logger from '@/logger';
import {
  AztecChainName,
  contracts,
  getL1,
  governanceAbis,
} from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { getChainParams } from '@/server/tools/chains/params';
import { readContractWithFailover } from '@/server/utils/viem-client-with-failover';

const { logInfo, logError } = logger('get-governance-config');

export interface GovernanceConfiguration {
  proposeConfig: {
    lockDelay: bigint;
    lockAmount: bigint;
  };
  votingDelay: bigint;
  votingDuration: bigint;
  executionDelay: bigint;
  gracePeriod: bigint;
  quorum: bigint;
  requiredYeaMargin: bigint;
  minimumVotes: bigint;
}

interface ContractConfigurationResult {
  proposeConfig: {
    lockDelay: bigint;
    lockAmount: bigint;
  };
  votingDelay: bigint;
  votingDuration: bigint;
  executionDelay: bigint;
  gracePeriod: bigint;
  quorum: bigint;
  requiredYeaMargin: bigint;
  minimumVotes: bigint;
}

export const getGovernanceConfig = async (
  chainName: AztecChainName,
): Promise<GovernanceConfiguration | null> => {
  try {
    const l1ChainName = getL1[chainName];
    if (!l1ChainName) {
      logError(`${chainName}: No L1 chain mapping found`);
      return null;
    }

    const l1Chain = getChainParams(l1ChainName);
    const l1RpcUrls = l1Chain.nodes?.filter((n) => n.type === 'rpc').map((n) => n.url) ?? [];

    if (l1RpcUrls.length === 0) {
      logError(`${chainName}: No L1 RPC URLs available`);
      return null;
    }

    const contractAddress = contracts[chainName].governanceAddress;
    const abi = governanceAbis[chainName] as Abi;

    logInfo(`${chainName}: Fetching governance configuration from ${contractAddress}`);

    const result = await readContractWithFailover<ContractConfigurationResult>(
      l1RpcUrls,
      {
        address: contractAddress as `0x${string}`,
        abi,
        functionName: 'getConfiguration',
        args: [],
      },
      `${chainName}-governance-config`,
    );

    const config: GovernanceConfiguration = {
      proposeConfig: {
        lockDelay: result.proposeConfig.lockDelay,
        lockAmount: result.proposeConfig.lockAmount,
      },
      votingDelay: result.votingDelay,
      votingDuration: result.votingDuration,
      executionDelay: result.executionDelay,
      gracePeriod: result.gracePeriod,
      quorum: result.quorum,
      requiredYeaMargin: result.requiredYeaMargin,
      minimumVotes: result.minimumVotes,
    };

    logInfo(`${chainName}: Governance configuration fetched successfully`);
    return config;
  } catch (e: any) {
    logError(`${chainName}: Failed to fetch governance config: ${e.message}`);
    return null;
  }
};

export default getGovernanceConfig;
