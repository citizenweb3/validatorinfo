import { Abi } from 'viem';

import { AztecChainName, contracts, tokenAbis } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { readContractWithFailover } from '@/server/utils/viem-client-with-failover';

export const getTotalSupply = async (rpcUrls: string[], chainName: AztecChainName): Promise<bigint> => {
  const contractAddress = contracts[chainName].tokenAddress;
  const abi = tokenAbis[chainName] as Abi;

  try {
    const totalSupply = await readContractWithFailover<bigint>(
      rpcUrls,
      {
        address: contractAddress as `0x${string}`,
        abi: abi,
        functionName: 'totalSupply',
        args: [],
      },
      `${chainName}-node-stake`,
    );

    return totalSupply;
  } catch (e: any) {
    throw new Error(`Failed to fetch total supply: ${e.message}`);
  }
};
