import { AztecChainName, getL1 } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { getChainParams } from '@/server/tools/chains/params';

export const getL1RpcUrls = (chainName: AztecChainName): string[] => {
  const l1ChainName = getL1[chainName];
  if (!l1ChainName) return [];

  const l1Chain = getChainParams(l1ChainName);
  return l1Chain.nodes?.filter((n: any) => n.type === 'rpc').map((n: any) => n.url) ?? [];
};
