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

const { logError } = logger('get-epoch-duration');

const getEpochDuration = async (chainName: string): Promise<bigint | null> => {
  const l1Chain = getChainParams(getL1[chainName]);
  const l1RpcUrls = l1Chain.nodes.filter((n: any) => n.type === 'rpc').map((n: any) => n.url);

  if (!l1RpcUrls.length) {
    logError('No L1 RPC URLs found - epoch duration will not be available');
    return null;
  }

  try {
    const contractAddress = contracts[chainName as AztecChainName].rollupAddress;
    const abi = rollupAbis[chainName as AztecChainName] as Abi;

    const epochDuration = await readContractWithFailover<bigint>(
      l1RpcUrls,
      {
        address: contractAddress as `0x${string}`,
        abi: abi,
        functionName: 'getEpochDuration',
        args: [],
      },
      `${chainName}-get-epoch-duration`,
    );

    return epochDuration;
  } catch (e) {
    logError(`${chainName} - can't fetch epoch duration`);
    return null;
  }
};

export default getEpochDuration;
