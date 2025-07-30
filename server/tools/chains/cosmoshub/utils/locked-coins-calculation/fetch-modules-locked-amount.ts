import logger from '@/logger';
import { AddChainProps } from '@/server/tools/chains/chain-indexer';
import { fetchAccountBalance } from '@/server/tools/chains/cosmoshub/utils/fetch-account-balance';
import fetchChainData from '@/server/tools/get-chain-data';

const { logError, logWarn } = logger('cosmos-fetch-module-tokens');

const fetchNoSendModuleAccounts = async (chain: AddChainProps): Promise<string[]> => {
  const resp = await fetchChainData<{
    accounts?: { name: string; base_account: { address: string }; permissions?: string[] }[];
  }>(chain.name, 'rest', '/cosmos/auth/v1beta1/module_accounts');

  if (!resp?.accounts?.length) {
    logError(`${chain.name} module_accounts endpoint returned empty data`);
    return [];
  }

  return resp.accounts
    .filter(
      (acc) =>
        !(acc.permissions ?? []).map((p) => p.toLowerCase()).includes('send') && acc.name !== 'bonded_tokens_pool',
    )
    .map((acc) => acc.base_account.address);
};

const fetchModulesLockedAmount = async (chain: AddChainProps): Promise<string | null> => {
  let total = BigInt(0);
  const modules = await fetchNoSendModuleAccounts(chain);
  if (modules.length === 0) {
    logError(`No non‑Send modules found on ${chain.name}`);
    return null;
  }

  try {
    for (const address of modules) {
      const balance = await fetchAccountBalance(chain, 'balances', address);
      if (balance !== null && balance !== undefined) total += balance;
    }
  } catch (e: any) {
    if (e instanceof Error && e.message && e.message.includes('No working endpoints available')) {
      logError(`No working endpoints for chain ${chain.name}, terminating modules locked amount calculation`, e);
      return null;
    }
  }

  return total ? String(total) : null;
};

export default fetchModulesLockedAmount;
