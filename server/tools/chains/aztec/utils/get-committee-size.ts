import { Abi } from 'viem';

import logger from '@/logger';
import {
  AztecChainName,
  getContracts,
  getL1,
  rollupAbis,
} from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { getChainParams } from '@/server/tools/chains/params';
import { readContractWithFailover } from '@/server/utils/viem-client-with-failover';

const { logError } = logger('get-committee-size');

const getCommitteeSizeUtil = async (chainName: string) => {
  const l1Chain = getChainParams(getL1[chainName]);
  const l1RpcUrls = l1Chain.nodes.filter((n: any) => n.type === 'rpc').map((n: any) => n.url);

  if (!l1RpcUrls.length) {
    logError('No L1 RPC URLs found - stake data will not be available');
    return null;
  }

  try {
    const l1Contracts = await getContracts(chainName as AztecChainName);
    const contractAddress = l1Contracts.rollupAddress;
    const abi = rollupAbis[chainName as AztecChainName] as Abi;

    const committeeSize = await readContractWithFailover<bigint>(
      l1RpcUrls,
      {
        address: contractAddress as `0x${string}`,
        abi: abi,
        functionName: 'getTargetCommitteeSize',
        args: [],
      },
      `${chainName}-get-committee-size`,
    );

    return committeeSize;
  } catch (e) {
    logError(`${chainName} - can't fetch committee size - ${e}`);
    return null;
  }
};

export default getCommitteeSizeUtil;
