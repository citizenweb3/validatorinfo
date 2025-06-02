import logger from '@/logger';
import fetchChainData from '@/server/tools/get-chain-data';
import { GetCommTaxFunction } from '@/server/tools/chains/chain-indexer';

const { logError } = logger('cosmos-comm-tax');

const getCommTax: GetCommTaxFunction = async (chain) => {
  try {
    return await fetchChainData<{ params: { community_tax: string } }>(
      chain.name,
      'rest',
      `/cosmos/distribution/v1beta1/params`,
    ).then((data) => Number(data.params.community_tax) * 100);
  } catch (e) {
    logError(`${chain.name} Can't fetch communityTax: `, e);
    return null;
  }
};

export default getCommTax;
