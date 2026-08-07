import 'server-only';

import logger from '@/logger';
import { MONERO_BLOCK_TIME_SECONDS } from '@/server/tools/chains/monero/constants';
import chainService, { ChainWithParamsAndTokenomics } from '@/services/chain-service';
import moneroService from '@/services/monero-service';
import priceHistoryService from '@/services/price-history-service';
import {
  type MiningEmissionContext,
  type MiningNetworkFees,
  type MiningPoolFeeOption,
  type MiningTopPool,
  buildMiningCoreSnapshot,
  buildMiningEmissionContext,
  buildMiningNetworkFees,
} from '@/utils/mining-economics-context';
import { MiningNetworkTrend, buildMiningNetworkTrend, selectMiningTrendWindow } from '@/utils/mining-network-trend';

const { logError } = logger('mining-profitability-service');

export interface MoneroMiningEconomics {
  averageReward: number;
  blockTimeSeconds: number;
  emission: MiningEmissionContext | null;
  networkDifficulty: string | null;
  networkFees: MiningNetworkFees | null;
  networkHashrateHps: number;
  networkTrend: MiningNetworkTrend | null;
  poolFees: MiningPoolFeeOption[];
  tokenPriceUsd: number;
  tokenSymbol: string;
  topPools: MiningTopPool[];
  weightedPoolFeePercent: number | null;
}

const resolveOptionalSource = async <T>(request: Promise<T>, fallback: T, message: string): Promise<T> => {
  try {
    return await request;
  } catch (error: unknown) {
    logError(message, error);
    return fallback;
  }
};

const getMoneroNetworkTrend = async (chainId: number, referenceAt: Date): Promise<MiningNetworkTrend | null> => {
  const [historyStart, snapshots, priceHistory] = await Promise.all([
    moneroService.getMoneroHashrateHistoryStart(),
    moneroService.getMoneroHashrateHistory('30d'),
    priceHistoryService.getChartData(chainId),
  ]);

  const windowDays = selectMiningTrendWindow(historyStart, referenceAt);
  if (windowDays === null) return null;

  return buildMiningNetworkTrend({ priceHistory, referenceAt, snapshots, windowDays });
};

const getMoneroMiningEconomics = async (
  chain: ChainWithParamsAndTokenomics | null,
): Promise<MoneroMiningEconomics | null> => {
  if (!chain || chain.name !== 'monero' || chain.consensusType !== 'pow' || chain.params?.coinDecimals == null) {
    return null;
  }

  const referenceAt = new Date();
  const networkTrendPromise = getMoneroNetworkTrend(chain.id, referenceAt).catch((error: unknown) => {
    logError('Unable to build Monero mining network trend; returning current economics without it', error);
    return null;
  });
  const poolStatsPromise = resolveOptionalSource(
    moneroService.getMoneroPoolStats('24h'),
    [],
    'Unable to load Monero pool stats; returning economics without pool context',
  );
  const txMetricsPromise = resolveOptionalSource(
    moneroService.getMoneroTxMetrics24h(),
    null,
    'Unable to load Monero transaction metrics; returning economics without fee context',
  );
  const supplyPromise = resolveOptionalSource(
    moneroService.getMoneroSupply(),
    null,
    'Unable to load Monero supply; returning economics without emission context',
  );
  const [price, snapshot, blockMetrics, poolStats, txMetrics, supplyRaw, networkTrend] = await Promise.all([
    chainService.getTokenPriceByChainId(chain.id),
    moneroService.getMoneroNetworkSnapshot(),
    moneroService.getMoneroBlockMetrics24h(),
    poolStatsPromise,
    txMetricsPromise,
    supplyPromise,
    networkTrendPromise,
  ]);

  const coreSnapshot = buildMiningCoreSnapshot({
    averageRewardAtomic: blockMetrics?.averageRewardAtomic ?? null,
    coinDecimals: chain.params.coinDecimals,
    networkSnapshot: snapshot,
    poolStats,
    tokenPriceUsd: price?.value ?? Number.NaN,
    tokenSymbol: chain.params.denom ?? 'XMR',
  });
  if (!coreSnapshot) return null;

  return {
    ...coreSnapshot,
    blockTimeSeconds: MONERO_BLOCK_TIME_SECONDS,
    emission: buildMiningEmissionContext(supplyRaw),
    networkFees: buildMiningNetworkFees(txMetrics, supplyRaw),
    networkTrend,
  };
};

const miningProfitabilityService = {
  getMoneroMiningEconomics,
};

export default miningProfitabilityService;
export { getMoneroMiningEconomics };
export type { MiningPoolFeeOption } from '@/utils/mining-economics-context';
