import logger from '@/logger';
import { AddChainProps } from '@/server/tools/chains/chain-indexer';
import fetchChainData from '@/server/tools/get-chain-data';

const { logError } = logger('cosmos-fetch-accounts-balance');

type SlugType = 'balances' | 'spendable_balances';

export const fetchAccountBalance = async (
  chain: AddChainProps,
  slug: SlugType,
  address: string,
): Promise<bigint | null> => {
  try {
    const response = await fetchChainData<{ balance: { amount: string } }>(
      chain.name,
      'rest',
      `/cosmos/bank/v1beta1/${slug}/${address}/by_denom?denom=${chain.minimalDenom}`,
    );

    if (response?.balance?.amount == null || response?.balance?.amount === '') {
      logError(`${chain.name} no amount for address: ${address}.`);
      return null;
    }
    return BigInt(String(response.balance.amount).split('.')[0]);
  } catch (e) {
    if (e instanceof Error && e.message && e.message.includes('No working endpoints available')) {
      throw e;
    }
    logError(`Can't fetch amount for account ${address} with error: ${e}.`);
    return null;
  }
};
