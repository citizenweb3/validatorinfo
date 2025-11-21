import { Abi } from 'viem';

import { contracts, gseAbis } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { readContractWithFailover } from '@/server/utils/viem-client-with-failover';

type AztecChainName = keyof typeof contracts;

export const getBondedTokens = async (rpcUrls: string[], chainName: AztecChainName): Promise<bigint> => {
  const contractAddress = contracts[chainName].gseAddress;
  const abi = gseAbis[chainName] as Abi;

  try {
    const bondedTokens = await readContractWithFailover<bigint>(
      rpcUrls,
      {
        address: contractAddress as `0x${string}`,
        abi: abi,
        functionName: 'totalSupply',
        args: [],
      },
      `${chainName}-node-stake`,
    );

    return bondedTokens;
  } catch (e: any) {
    throw new Error(`Failed to fetch total supply: ${e.message}`);
  }
};
