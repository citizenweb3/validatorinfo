import 'server-only';

import { MONERO_BLOCK_TIME_SECONDS } from '@/server/tools/chains/monero/constants';
import chainService, { ChainWithParamsAndTokenomics } from '@/services/chain-service';
import moneroService from '@/services/monero-service';
import { weightedAverageFeePercent } from '@/utils/mining-revenue';
import { atomicToDecimal } from '@/utils/monero-emission';

export interface MiningPoolFeeOption {
  feePercent: number;
  name: string;
  slug: string;
}

export interface MoneroMiningEconomics {
  averageReward: number;
  blockTimeSeconds: number;
  networkHashrateHps: number;
  poolFees: MiningPoolFeeOption[];
  tokenPriceUsd: number;
  tokenSymbol: string;
  weightedPoolFeePercent: number;
}

const getMoneroMiningEconomics = async (
  chain: ChainWithParamsAndTokenomics | null,
): Promise<MoneroMiningEconomics | null> => {
  if (!chain || chain.name !== 'monero' || chain.consensusType !== 'pow' || chain.params?.coinDecimals == null) {
    return null;
  }

  const [price, snapshot, blockMetrics, poolStats] = await Promise.all([
    chainService.getTokenPriceByChainId(chain.id),
    moneroService.getMoneroNetworkSnapshot(),
    moneroService.getMoneroBlockMetrics24h(),
    moneroService.getMoneroPoolStats('24h'),
  ]);

  if (!price || price.value <= 0 || !snapshot || !blockMetrics?.averageRewardAtomic) return null;

  const networkHashrateHps = Number(snapshot.hashrate);
  if (!Number.isFinite(networkHashrateHps) || networkHashrateHps <= 0) return null;

  let averageReward: number;
  try {
    averageReward = atomicToDecimal(BigInt(blockMetrics.averageRewardAtomic), chain.params.coinDecimals);
  } catch {
    return null;
  }

  if (!Number.isFinite(averageReward) || averageReward <= 0) return null;

  const knownPools = poolStats.filter((stat) => stat.pool.isVerified && stat.pool.slug !== 'unknown');
  const weightedPoolFee = weightedAverageFeePercent(
    knownPools.map((stat) => ({
      feePercent: stat.pool.feePercent,
      hashrateHps: Number(stat.hashrateEstimate),
    })),
  );
  if (weightedPoolFee === null) return null;

  const poolFees = knownPools
    .filter((stat) => stat.pool.feePercent !== null)
    .map((stat) => ({
      feePercent: stat.pool.feePercent as number,
      name: stat.pool.name,
      slug: stat.pool.slug,
    }))
    .sort((a, b) => a.name.localeCompare(b.name) || a.slug.localeCompare(b.slug));

  return {
    averageReward,
    blockTimeSeconds: MONERO_BLOCK_TIME_SECONDS,
    networkHashrateHps,
    poolFees,
    tokenPriceUsd: price.value,
    tokenSymbol: chain.params.denom ?? 'XMR',
    weightedPoolFeePercent: weightedPoolFee,
  };
};

const miningProfitabilityService = {
  getMoneroMiningEconomics,
};

export default miningProfitabilityService;
export { getMoneroMiningEconomics };
