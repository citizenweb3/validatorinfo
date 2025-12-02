import { Abi } from 'viem';

import { AztecChainName, contracts, gseAbis } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { readContractWithFailover } from '@/server/utils/viem-client-with-failover';

export const getNodeStake = async (
  attesterAddress: string,
  rpcUrls: string[],
  chainName: AztecChainName,
): Promise<bigint> => {
  const contractAddress = contracts[chainName].gseAddress;
  const instance = contracts[chainName].rollupAddress;
  const abi = gseAbis[chainName] as Abi;

  try {
    const stake = await readContractWithFailover<bigint>(
      rpcUrls,
      {
        address: contractAddress as `0x${string}`,
        abi: abi,
        functionName: 'effectiveBalanceOf',
        args: [instance as `0x${string}`, attesterAddress as `0x${string}`],
      },
      `${chainName}-node-stake`,
    );

    return stake;
  } catch (e: any) {
    throw new Error(`Failed to fetch stake for attester ${attesterAddress}: ${e.message}`);
  }
};
