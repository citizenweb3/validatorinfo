import { getL1 } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { getChainParams } from '@/server/tools/chains/params';
import { createViemClientWithFailover } from '@/server/utils/viem-client-with-failover';
import GSE_PAYLOAD_ABI from '@/server/tools/chains/aztec/utils/contracts/abis/aztec/GSE_PAYLOAD_ABI.json';
import { Abi } from 'viem';

export const getPayloadUriUtil = async (
  payloadAddress: string,
  chainName: string,
): Promise<string | null> => {
  try {
    const aztecChainName = chainName as 'aztec' | 'aztec-testnet';
    const l1ChainName = getL1[aztecChainName];

    if (!l1ChainName) {
      return null;
    }

    const l1Chain = getChainParams(l1ChainName);
    const l1RpcUrls = l1Chain.nodes
      .filter((n: { type: string }) => n.type === 'rpc')
      .map((n: { url: string }) => n.url);

    if (!l1RpcUrls || l1RpcUrls.length === 0) {
      return null;
    }

    const client = createViemClientWithFailover(l1RpcUrls, {
      loggerName: `${chainName}-get-payload-uri`,
      timeout: 10000,
      retryCount: 2,
    });

    const uri = await client.readContract({
      address: payloadAddress as `0x${string}`,
      abi: GSE_PAYLOAD_ABI as Abi,
      functionName: 'getURI',
    });

    return uri as string;
  } catch {
    return null;
  }
};