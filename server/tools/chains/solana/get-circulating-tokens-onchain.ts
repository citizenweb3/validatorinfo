import logger from '@/logger';
import { AddChainProps, GetCirculatingTokensOnchain } from '@/server/tools/chains/chain-indexer';
import { jsonRpcClientWithFailover } from '@/server/utils/json-rpc-client';

const { logError } = logger('solana-circulating-tokens-onchain');

const getCirculatingTokensOnchain: GetCirculatingTokensOnchain = async (chain: AddChainProps) => {
  try {
    const rpcUrls = chain.nodes.filter((n: any) => n.type === 'rpc').map((n: any) => n.url);
    if (!rpcUrls.length) {
      throw new Error('No RPC URLs provided in chain object');
    }

    const supplyData = await jsonRpcClientWithFailover<{ value: { circulating: string } }>(
      rpcUrls,
      'getSupply',
      undefined,
      'solana-circulating-tokens-onchain'
    );
    return supplyData.value.circulating ? String(supplyData.value.circulating) : null;
  } catch (e) {
    logError(`Can't fetch circulating tokens for ${chain.name} error: ${e} `);
    return null;
  }
};

export default getCirculatingTokensOnchain;
