import { Abi, getAddress } from 'viem';

import { AztecChainName, contracts, gseAbis } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { readContractWithFailover } from '@/server/utils/viem-client-with-failover';

let cachedLatestRollup: string | null = null;
let cachedBonusInstance: string | null = null;

export const fetchNodeStake = async (
  attesterAddress: string,
  rpcUrls: string[],
  chainName: AztecChainName,
): Promise<bigint> => {
  const contractAddress = contracts[chainName].gseAddress;
  const abi = gseAbis[chainName] as Abi;

  try {
    const checksummedContractAddress = getAddress(contractAddress);
    const checksummedAttesterAddress = getAddress(attesterAddress);

    if (!cachedLatestRollup) {
      const latestRollup = await readContractWithFailover<string>(
        rpcUrls,
        {
          address: checksummedContractAddress as `0x${string}`,
          abi: abi,
          functionName: 'getLatestRollup',
          args: [],
        },
        `${chainName}-latest-rollup`,
      );
      cachedLatestRollup = getAddress(latestRollup);
    }

    if (!cachedBonusInstance) {
      const bonusInstance = await readContractWithFailover<string>(
        rpcUrls,
        {
          address: checksummedContractAddress as `0x${string}`,
          abi: abi,
          functionName: 'BONUS_INSTANCE_ADDRESS',
          args: [],
        },
        `${chainName}-bonus-instance`,
      );
      cachedBonusInstance = getAddress(bonusInstance);
    }

    let stake: bigint = BigInt(0);

    stake = await readContractWithFailover<bigint>(
      rpcUrls,
      {
        address: checksummedContractAddress as `0x${string}`,
        abi: abi,
        functionName: 'effectiveBalanceOf',
        args: [cachedLatestRollup as `0x${string}`, checksummedAttesterAddress as `0x${string}`],
      },
      `${chainName}-node-stake`,
    );

    if (stake === BigInt(0)) {
      stake = await readContractWithFailover<bigint>(
        rpcUrls,
        {
          address: checksummedContractAddress as `0x${string}`,
          abi: abi,
          functionName: 'effectiveBalanceOf',
          args: [cachedBonusInstance as `0x${string}`, checksummedAttesterAddress as `0x${string}`],
        },
        `${chainName}-node-stake`,
      );
    }

    return stake;
  } catch (e: any) {
    throw new Error(`Failed to fetch stake for attester ${attesterAddress}: ${e.message}`);
  }
};
