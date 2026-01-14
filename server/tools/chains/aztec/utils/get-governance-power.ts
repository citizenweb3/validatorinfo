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

const { logInfo, logError } = logger('get-governance-power');

export const getTotalVotingPower = async (chainName: AztecChainName): Promise<bigint | null> => {
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

    logInfo(`${chainName}: Fetching total voting power from ${contractAddress}`);

    const result = await readContractWithFailover<bigint>(
      l1RpcUrls,
      {
        address: contractAddress as `0x${string}`,
        abi,
        functionName: 'totalPowerNow',
        args: [],
      },
      `${chainName}-total-power`,
    );

    logInfo(`${chainName}: Total voting power: ${result.toString()}`);
    return result;
  } catch (e: any) {
    logError(`${chainName}: Failed to fetch total voting power: ${e.message}`);
    return null;
  }
};

export const getUserVotingPower = async (
  chainName: AztecChainName,
  userAddress: string,
): Promise<bigint | null> => {
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

    logInfo(`${chainName}: Fetching voting power for ${userAddress}`);

    const result = await readContractWithFailover<bigint>(
      l1RpcUrls,
      {
        address: contractAddress as `0x${string}`,
        abi,
        functionName: 'powerNow',
        args: [userAddress as `0x${string}`],
      },
      `${chainName}-user-power`,
    );

    logInfo(`${chainName}: User ${userAddress} voting power: ${result.toString()}`);
    return result;
  } catch (e: any) {
    logError(`${chainName}: Failed to fetch user voting power: ${e.message}`);
    return null;
  }
};

export const getHistoricalPower = async (
  chainName: AztecChainName,
  userAddress: string,
  timestamp: bigint,
): Promise<bigint | null> => {
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

    logInfo(`${chainName}: Fetching historical power for ${userAddress} at ${timestamp}`);

    const result = await readContractWithFailover<bigint>(
      l1RpcUrls,
      {
        address: contractAddress as `0x${string}`,
        abi,
        functionName: 'powerAt',
        args: [userAddress as `0x${string}`, timestamp],
      },
      `${chainName}-historical-power`,
    );

    logInfo(`${chainName}: User ${userAddress} power at ${timestamp}: ${result.toString()}`);
    return result;
  } catch (e: any) {
    logError(`${chainName}: Failed to fetch historical power: ${e.message}`);
    return null;
  }
};

export const getTotalHistoricalPower = async (
  chainName: AztecChainName,
  timestamp: bigint,
): Promise<bigint | null> => {
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

    logInfo(`${chainName}: Fetching total historical power at ${timestamp}`);

    const result = await readContractWithFailover<bigint>(
      l1RpcUrls,
      {
        address: contractAddress as `0x${string}`,
        abi,
        functionName: 'totalPowerAt',
        args: [timestamp],
      },
      `${chainName}-total-historical-power`,
    );

    logInfo(`${chainName}: Total power at ${timestamp}: ${result.toString()}`);
    return result;
  } catch (e: any) {
    logError(`${chainName}: Failed to fetch total historical power: ${e.message}`);
    return null;
  }
};
