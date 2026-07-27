import 'server-only';

import db from '@/db';
import logger from '@/logger';
import { getAccountIndexerFactsClient } from '@/services/account-indexer-facts';
import { CACHE_KEYS, CACHE_TTL, cacheGetOrFetch } from '@/services/redis-cache';
import {
  type AccountCoverage,
  type DelegatedStakePoint,
  type GenesisDelegatedStakeRow,
  composeDelegatedStakeSeries,
  drainAccountStakingDeltas,
  selectDelegatedStakeAtHeights,
} from '@/utils/account-history';

const { logError } = logger('delegated-stake-service');

export type DelegatedStakeHistoryMeta = {
  approximate: true;
  initialHeight: string;
  genesisBoundary: AccountCoverage;
  indexerCoverage: AccountCoverage;
  indexedDeltaTotal: string;
  skippedAmbiguousMsgExec: string;
};

export type DelegatedStakeAtHeightsResult = {
  values: DelegatedStakePoint[];
  meta: DelegatedStakeHistoryMeta;
};

type DelegatedStakeHistory = {
  series: DelegatedStakePoint[];
  meta: DelegatedStakeHistoryMeta;
};

type CachedDelegatedStakeHistory = { value: DelegatedStakeHistory | null };

type GenesisDelegatedStakeBaseline = {
  initialHeight: string;
  boundary: AccountCoverage;
  rows: GenesisDelegatedStakeRow[];
};

const getGenesisBaseline = async (
  chainName: string,
  delegatorAddress: string,
): Promise<GenesisDelegatedStakeBaseline | null> => {
  const snapshot = await db.genesisSnapshot.findFirst({
    where: { status: 'ready', chain: { name: chainName } },
    select: {
      initialHeight: true,
      boundaryHeight: true,
      boundaryTime: true,
      delegations: {
        where: { delegatorAddress },
        select: { denom: true, amount: true },
      },
    },
  });
  if (!snapshot) return null;

  return {
    initialHeight: snapshot.initialHeight.toString(),
    boundary: {
      earliest_height: snapshot.boundaryHeight.toString(),
      earliest_time: snapshot.boundaryTime.toISOString(),
    },
    rows: snapshot.delegations.map((delegation) => ({
      denom: delegation.denom,
      amount: delegation.amount.toFixed(0),
    })),
  };
};

const loadDelegatedStakeHistory = async (
  chainName: string,
  delegatorAddress: string,
): Promise<CachedDelegatedStakeHistory> => {
  const client = getAccountIndexerFactsClient(chainName);
  if (!client) return { value: null };

  const baseline = await getGenesisBaseline(chainName, delegatorAddress);
  if (!baseline) return { value: null };

  const [coverageResponse, drainedDeltas] = await Promise.all([
    client.getCoverage({ cache: 'no-store', timeout: 30_000 }),
    drainAccountStakingDeltas((cursor) =>
      client.getStakingDeltas(
        {
          delegator: delegatorAddress,
          limit: 100,
          before_height: cursor?.next_before_height,
          before_index: cursor?.next_before_index,
          before_msg_index: cursor?.next_before_msg_index,
        },
        { cache: 'no-store', timeout: 30_000 },
      ),
    ),
  ]);
  if (!coverageResponse) throw new Error(`indexer coverage is unavailable for ${chainName}`);

  return {
    value: {
      series: composeDelegatedStakeSeries(baseline.initialHeight, baseline.rows, drainedDeltas.rows),
      meta: {
        approximate: true,
        initialHeight: baseline.initialHeight,
        genesisBoundary: baseline.boundary,
        indexerCoverage: coverageResponse.data,
        indexedDeltaTotal: drainedDeltas.total,
        skippedAmbiguousMsgExec: drainedDeltas.skippedAmbiguousMsgExec,
      },
    },
  };
};

const delegatedStakeInflight = new Map<string, Promise<DelegatedStakeHistory | null>>();

const getDelegatedStakeHistory = (
  chainName: string,
  delegatorAddress: string,
): Promise<DelegatedStakeHistory | null> => {
  const key = CACHE_KEYS.account.delegatedStake(chainName, delegatorAddress);
  const existing = delegatedStakeInflight.get(key);
  if (existing) return existing;

  const promise = cacheGetOrFetch<CachedDelegatedStakeHistory>(
    key,
    () => loadDelegatedStakeHistory(chainName, delegatorAddress),
    CACHE_TTL.MEDIUM,
  )
    .then((cached) => cached?.value ?? null)
    .catch((error: unknown) => {
      logError(`Failed to compose delegated stake for ${chainName}`, error);
      return null;
    })
    .finally(() => delegatedStakeInflight.delete(key));

  delegatedStakeInflight.set(key, promise);
  return promise;
};

export const getDelegatedStakeAtHeights = async (
  chainName: string,
  delegatorAddress: string,
  heights: readonly string[],
): Promise<DelegatedStakeAtHeightsResult | null> => {
  const normalizedChainName = chainName.toLowerCase();
  const normalizedAddress = delegatorAddress.trim();
  if (!getAccountIndexerFactsClient(normalizedChainName)) return null;
  if (normalizedAddress.length < 8 || normalizedAddress.length > 128) return null;

  const history = await getDelegatedStakeHistory(normalizedChainName, normalizedAddress);
  if (!history) return null;
  return {
    values: selectDelegatedStakeAtHeights(history.series, heights),
    meta: history.meta,
  };
};

const DelegatedStakeService = { getDelegatedStakeAtHeights };

export default DelegatedStakeService;
