import logger from '@/logger';
import { AddChainProps, GetCirculatingTokensOnchain } from '@/server/tools/chains/chain-indexer';
import fetchSolanaData from '@/server/tools/chains/solana/utils/fetch-solana-data';

const { logError } = logger('solana-circulating-tokens-onchain');

const getCirculatingTokensOnchain: GetCirculatingTokensOnchain = async (chain: AddChainProps) => {
  try {
    const supplyData = await fetchSolanaData<{ value: { circulating: string } }>('getSupply');
    return supplyData.value.circulating ? String(supplyData.value.circulating) : null;
  } catch (e) {
    logError(`Can't fetch circulating tokens for ${chain.name} error: ${e} `);
    return null;
  }
};

export default getCirculatingTokensOnchain;
