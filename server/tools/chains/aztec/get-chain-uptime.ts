import { Chain } from '@prisma/client';
import { Abi } from 'viem';

import logger from '@/logger';
import {
  AztecChainName,
  contracts,
  getL1,
  rollupAbis,
} from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { getChainParams } from '@/server/tools/chains/params';
import { readContractWithFailover } from '@/server/utils/viem-client-with-failover';

const { logError } = logger('get-uptime');

export const getChainUptime = async (dbChain: Chain) => {
  const l1Chain = getChainParams(getL1[dbChain.name]);
  const l1RpcUrls = l1Chain.nodes.filter((n: any) => n.type === 'rpc').map((n: any) => n.url);

  if (!l1RpcUrls.length) {
    logError('No L1 RPC URLs found - stake data will not be available');
    return null;
  }

  try {
    const contractAddress = contracts[dbChain.name as AztecChainName].rollupAddress;
    const abi = rollupAbis[dbChain.name as AztecChainName] as Abi;

    const avgTxInterval = await readContractWithFailover<bigint>(
      l1RpcUrls,
      {
        address: contractAddress as `0x${string}`,
        abi: abi,
        functionName: 'getSlotDuration',
        args: [],
      },
      `${dbChain.name}-chain-uptime`,
    );

    if (!avgTxInterval) {
      logError(`${dbChain.name} - can't fetch slot duration`);
      return null;
    }

    const currentTime = Date.now();

    const uptimeHeight = await readContractWithFailover<bigint>(
      l1RpcUrls,
      {
        address: contractAddress as `0x${string}`,
        abi: abi,
        functionName: 'getCurrentSlot',
        args: [],
      },
      `${dbChain.name}-chain-uptime`,
    );

    return {
      lastUptimeUpdated: new Date(currentTime),
      uptimeHeight: Number(uptimeHeight),
      avgTxInterval: Number(avgTxInterval),
    };
  } catch (e) {
    logError(`${dbChain.name} - can't fetch uptime or block height`);
    return null;
  }
};

export default getChainUptime;
