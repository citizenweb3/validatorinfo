import { Abi, getAddress } from 'viem';

import logger from '@/logger';
import {
  AztecChainName,
  contracts,
  getL1,
  rollupAbis,
} from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { getChainParams } from '@/server/tools/chains/params';
import { readContractWithFailover } from '@/server/utils/viem-client-with-failover';

const { logError } = logger('get-current-epoch-committee');

const getCurrentEpochCommittee = async (chainName: string): Promise<string[] | null> => {
  const l1Chain = getChainParams(getL1[chainName]);
  const l1RpcUrls = l1Chain.nodes.filter((n: any) => n.type === 'rpc').map((n: any) => n.url);

  if (!l1RpcUrls.length) {
    logError('No L1 RPC URLs found - committee data will not be available');
    return null;
  }

  try {
    const contractAddress = contracts[chainName as AztecChainName].rollupAddress;
    const abi = rollupAbis[chainName as AztecChainName] as Abi;

    const committee = await readContractWithFailover<string[]>(
      l1RpcUrls,
      {
        address: contractAddress as `0x${string}`,
        abi: abi,
        functionName: 'getCurrentEpochCommittee',
        args: [],
      },
      `${chainName}-get-current-epoch-committee`,
    );

    if (!committee || !Array.isArray(committee)) {
      return null;
    }

    return committee.map((addr) => getAddress(addr));
  } catch (e) {
    logError(`${chainName} - can't fetch current epoch committee`);
    return null;
  }
};

export default getCurrentEpochCommittee;
