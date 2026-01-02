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

const { logError } = logger('get-active-attester-count');

const getActiveAttesterCount = async (chainName: string): Promise<bigint | null> => {
  const l1Chain = getChainParams(getL1[chainName]);
  const l1RpcUrls = l1Chain.nodes.filter((n: any) => n.type === 'rpc').map((n: any) => n.url);

  if (!l1RpcUrls.length) {
    logError('No L1 RPC URLs found - active attester count will not be available');
    return null;
  }

  try {
    const contractAddress = contracts[chainName as AztecChainName].rollupAddress;
    const abi = rollupAbis[chainName as AztecChainName] as Abi;

    const activeAttesterCount = await readContractWithFailover<bigint>(
      l1RpcUrls,
      {
        address: contractAddress as `0x${string}`,
        abi: abi,
        functionName: 'getActiveAttesterCount',
        args: [],
      },
      `${chainName}-get-active-attester-count`,
    );

    return activeAttesterCount;
  } catch (e) {
    logError(`${chainName} - can't fetch active attester count`);
    return null;
  }
};

export default getActiveAttesterCount;
