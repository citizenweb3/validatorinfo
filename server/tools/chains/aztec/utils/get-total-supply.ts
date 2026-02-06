import { Abi } from 'viem';

import db from '@/db';
import logger from '@/logger';
import { AztecChainName, contracts, tokenAbis } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { getL1RpcUrls } from '@/server/tools/chains/aztec/utils/get-l1-rpc-urls';
import { readContractWithFailover } from '@/server/utils/viem-client-with-failover';

const { logInfo, logError } = logger('get-total-supply-aztec');

const fetchTotalSupplyFromL1 = async (rpcUrls: string[], chainName: AztecChainName): Promise<bigint> => {
  const contractAddress = contracts[chainName].tokenAddress;
  const abi = tokenAbis[chainName] as Abi;

  return readContractWithFailover<bigint>(
    rpcUrls,
    {
      address: contractAddress as `0x${string}`,
      abi: abi,
      functionName: 'totalSupply',
      args: [],
    },
    `${chainName}-node-stake`,
  );
};

export const getTotalSupply = async (chainName: AztecChainName): Promise<bigint> => {
  try {
    const l1RpcUrls = getL1RpcUrls(chainName);

    if (l1RpcUrls.length) {
      const totalSupply = await fetchTotalSupplyFromL1(l1RpcUrls, chainName);
      logInfo(`${chainName}: Fetched totalSupply from L1 contract`);

      return totalSupply;
    }
  } catch (e: any) {
    logError(`${chainName}: Failed to fetch totalSupply from L1: ${e.message}, falling back to cache`);
  }

  let chain;

  try {
    chain = await db.chain.findFirst({
      where: { name: chainName },
      include: { tokenomics: true },
    });
  } catch (dbError: any) {
    logError(`${chainName}: Failed to query cache from database: ${dbError.message}`);
    throw new Error(`No totalSupply available - L1 failed and cache query failed: ${dbError.message}`);
  }

  const cachedSupply = chain?.tokenomics?.totalSupply?.trim();

  if (cachedSupply && /^\d+$/.test(cachedSupply)) {
    logInfo(`${chainName}: Using cached totalSupply from tokenomics`);
    return BigInt(cachedSupply);
  }

  if (cachedSupply) {
    logError(`${chainName}: Cached totalSupply is not a valid integer: "${cachedSupply}"`);
  }

  throw new Error(`No totalSupply available from L1 or cache`);
};
