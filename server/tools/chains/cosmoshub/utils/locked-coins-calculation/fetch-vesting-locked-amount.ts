import logger from '@/logger';
import { AddChainProps } from '@/server/tools/chains/chain-indexer';
import { fetchAccountBalance } from '@/server/tools/chains/cosmoshub/utils/fetch-account-balance';
import fetchChainData from '@/server/tools/get-chain-data';

const { logWarn, logError } = logger('cosmos-fetch-vesting-tokens');

const fetchVestingAccounts = async (chain: AddChainProps): Promise<string[]> => {
  const vesting = new Set<string>();
  let nextKey: string | undefined;
  const limit = 10000;

  while (true) {
    const qs = new URLSearchParams({ 'pagination.limit': limit.toString() });
    if (nextKey) qs.append('pagination.key', nextKey);
    const url = `/cosmos/auth/v1beta1/accounts?${qs.toString()}`;

    const response = await fetchChainData<{ accounts?: any[]; pagination?: { next_key?: string | null } }>(
      chain.name,
      'rest',
      url,
    );

    if (response?.accounts?.length) {
      for (const account of response.accounts) {
        const type = account['@type'] ?? account.type;
        if (type && (type.includes('VestingAccount') || type.includes('PermanentLockedAccount'))) {
          const addr =
            account.base_vesting_account?.base_account?.address ?? account.base_account?.address ?? account.address;
          if (addr) vesting.add(addr);
        }
      }
    }
    nextKey = response?.pagination?.next_key ?? undefined;
    if (!nextKey) break;
  }

  return Array.from(vesting);
};

const fetchVestingLockedAmount = async (chain: AddChainProps): Promise<string | null> => {
  let total = BigInt(0);

  const addresses = await fetchVestingAccounts(chain);

  if (addresses.length !== 0) {
    try {
      for (const addr of addresses) {
        const balance = await fetchAccountBalance(chain, 'balances', addr);
        const spendable = await fetchAccountBalance(chain, 'spendable_balances', addr);
        if (balance && spendable) {
          const locked = balance > spendable ? balance - spendable : BigInt(0);
          total += locked;
        } else if (balance) {
          total += balance;
        }
      }
    } catch (e: any) {
      if (e instanceof Error && e.message && e.message.includes('No working endpoints available')) {
        logError(`No working endpoints for chain ${chain.name}, terminating vesting locked amount calculation`, e);
        return null;
      }
    }

    return total ? String(total) : null;
  } else {
    logWarn(`No vesting accounts in ${chain.name}`);
    return null;
  }
};

export default fetchVestingLockedAmount;
