import logger from '@/logger';
import { GetInflationRate } from '@/server/tools/chains/chain-indexer';
import { jsonRpcClientWithFailover } from '@/server/utils/json-rpc-client';

const { logError } = logger('solana-inflation-rate');

const getInflationRate: GetInflationRate = async (chain) => {
  try {
    const rpcUrls = chain.nodes.filter((n: any) => n.type === 'rpc').map((n: any) => n.url);
    if (!rpcUrls.length) {
      throw new Error('No RPC URLs provided in chain object');
    }

    const response = await jsonRpcClientWithFailover<{ total: string }>(
      rpcUrls,
      'getInflationRate',
      undefined,
      'solana-inflation-rate'
    );
    return response.total ? Number(response.total) : null;
  } catch (e) {
    logError(`Error fetching inflation rate for ${chain.name}`, e);
    return null;
  }
};

export default getInflationRate;
