import 'server-only';

import db from '@/db';
import logger from '@/logger';
import { getChainLcdContext } from '@/services/chain-service';
import priceService from '@/services/price-service';
import { markAccountViewed } from '@/services/redis-cache';
import { type AccountValueReady, composeStoredAccountValue } from '@/utils/account-value';
import { normalizeBech32Address } from '@/utils/bech32-address';
import { isAccountBalanceChainSupported } from '@/utils/cosmos-account-balances';

const { logError, logWarn } = logger('account-balance-service');

export type AccountValueResult = AccountValueReady | { status: 'pending' } | { status: 'unsupported' };

export const getAccountValue = async (chainName: string, address: string): Promise<AccountValueResult> => {
  const normalizedChainName = chainName.toLowerCase();
  if (!isAccountBalanceChainSupported(normalizedChainName)) return { status: 'unsupported' };

  try {
    const context = await getChainLcdContext(normalizedChainName);
    if (!context) {
      logWarn(`${normalizedChainName}: chain parameters are missing for account value`);
      return { status: 'unsupported' };
    }

    const normalizedAddress = normalizeBech32Address(address, context.bech32Prefix);
    if (!normalizedAddress) return { status: 'unsupported' };
    void markAccountViewed(normalizedChainName, normalizedAddress, context.bech32Prefix);

    const [balance, price] = await Promise.all([
      db.accountBalance.findUnique({
        where: { chainId_address: { chainId: context.id, address: normalizedAddress } },
      }),
      priceService.getLatestPriceByChainName(normalizedChainName),
    ]);
    if (balance?.updatedAt && balance.denom !== context.minimalDenom) {
      logWarn(`${normalizedChainName}: account value denom is stale for ${normalizedAddress}`);
    }

    return composeStoredAccountValue(
      balance
        ? {
            denom: balance.denom,
            liquid: balance.liquid.toFixed(0),
            staked: balance.staked.toFixed(0),
            unbonding: balance.unbonding.toFixed(0),
            rewards: balance.rewards.toFixed(0),
            updatedAt: balance.updatedAt,
          }
        : null,
      context,
      price,
    );
  } catch (error) {
    logError(`Failed to read account value for ${normalizedChainName}`, error);
    return { status: 'pending' };
  }
};

const AccountBalanceService = { getAccountValue };

export default AccountBalanceService;
