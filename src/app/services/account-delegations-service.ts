import 'server-only';

import db from '@/db';
import logger from '@/logger';
import { createLcdJsonLoader } from '@/services/lcd-fetch-service';
import nodeService from '@/services/node-service';
import priceService from '@/services/price-service';
import { CACHE_KEYS, CACHE_TTL, cacheGetOrFetch } from '@/services/redis-cache';
import {
  type AccountDelegationNodeIdentity,
  type AccountDelegationRow,
  composeAccountDelegationRows,
  fetchAllLcdDelegations,
  fetchLcdRewardsByValidator,
  isAccountDelegationsChainSupported,
} from '@/utils/cosmos-account-delegations';

const { logError } = logger('account-delegations-service');

type LoadedAccountDelegations = {
  status: 'success' | 'empty';
  rows: AccountDelegationRow[];
  denom: string;
  tokenPrice: number | null;
};

export type AccountDelegationsResult =
  | LoadedAccountDelegations
  | { status: 'unsupported'; rows: [] }
  | { status: 'error'; rows: [] };

type ChainContext = {
  id: number;
  coinDecimals: number;
  denom: string;
  minimalDenom: string;
};

const getChainContext = async (chainName: string): Promise<ChainContext | null> => {
  const chain = await db.chain.findUnique({
    where: { name: chainName },
    select: {
      id: true,
      params: { select: { coinDecimals: true, denom: true, minimalDenom: true } },
    },
  });
  if (!chain?.params) return null;

  return {
    id: chain.id,
    coinDecimals: chain.params.coinDecimals,
    denom: chain.params.denom,
    minimalDenom: chain.params.minimalDenom,
  };
};

const loadAccountDelegations = async (
  chainName: string,
  delegatorAddress: string,
): Promise<LoadedAccountDelegations> => {
  const [context, lcdLoader, tokenPrice] = await Promise.all([
    getChainContext(chainName),
    createLcdJsonLoader(chainName),
    priceService.getLatestPriceByChainName(chainName),
  ]);
  if (!context) throw new Error(`chain parameters are missing for ${chainName}`);

  const loadJson = (path: string) => lcdLoader<unknown>(path);
  const [positions, rewardsByValidator] = await Promise.all([
    fetchAllLcdDelegations(delegatorAddress, context.minimalDenom, loadJson),
    fetchLcdRewardsByValidator(delegatorAddress, context.minimalDenom, loadJson),
  ]);
  const operatorAddresses = Array.from(new Set(positions.map((position) => position.validatorAddress)));
  const nodes = await nodeService.getNodesByOperatorAddresses(context.id, operatorAddresses);
  const identities: AccountDelegationNodeIdentity[] = nodes.map((node) => ({
    operatorAddress: node.operatorAddress,
    validatorId: node.validator?.id ?? null,
    moniker: node.validator?.moniker || node.moniker || node.operatorAddress,
    icon: node.validator?.url ?? null,
  }));
  const rows = composeAccountDelegationRows(positions, rewardsByValidator, identities, context.coinDecimals);

  return {
    status: rows.length > 0 ? 'success' : 'empty',
    rows,
    denom: context.denom,
    tokenPrice,
  };
};

const delegationsInflight = new Map<string, Promise<AccountDelegationsResult>>();

export const getAccountDelegations = (
  chainName: string,
  delegatorAddress: string,
): Promise<AccountDelegationsResult> => {
  const normalizedChainName = chainName.toLowerCase();
  const normalizedAddress = delegatorAddress.trim();
  if (!isAccountDelegationsChainSupported(normalizedChainName)) {
    return Promise.resolve({ status: 'unsupported', rows: [] });
  }
  if (!normalizedAddress) return Promise.resolve({ status: 'error', rows: [] });

  const key = CACHE_KEYS.delegations.byDelegator(normalizedChainName, normalizedAddress);
  const existing = delegationsInflight.get(key);
  if (existing) return existing;

  const promise = cacheGetOrFetch<LoadedAccountDelegations>(
    key,
    () => loadAccountDelegations(normalizedChainName, normalizedAddress),
    CACHE_TTL.SHORT,
  )
    .then((value): AccountDelegationsResult => value ?? { status: 'error', rows: [] })
    .catch((error: unknown): AccountDelegationsResult => {
      logError(`Failed to load account delegations for ${normalizedChainName}`, error);
      return { status: 'error', rows: [] };
    })
    .finally(() => {
      delegationsInflight.delete(key);
    });

  delegationsInflight.set(key, promise);
  return promise;
};

const AccountDelegationsService = { getAccountDelegations };

export default AccountDelegationsService;
