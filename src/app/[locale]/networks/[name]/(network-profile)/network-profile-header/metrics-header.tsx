import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import { networkProfileExample } from '@/app/networks/[name]/(network-profile)/networkProfileExample';
import PlusButton from '@/components/common/plus-button';
import Tooltip from '@/components/common/tooltip';
import { MONERO_BLOCK_TIME_SECONDS } from '@/server/tools/chains/monero/constants';
import chainService, { ChainWithParamsAndTokenomics } from '@/services/chain-service';
import moneroService from '@/services/monero-service';
import formatCash from '@/utils/format-cash';
import { estimateMiningReturn, weightedAverageFeePercent } from '@/utils/mining-revenue';
import { atomicToDecimal } from '@/utils/monero-emission';

interface OwnProps {
  chain: ChainWithParamsAndTokenomics | null;
}

interface MetricRow {
  key: string;
  title: string;
  data: string;
  tooltip?: string;
  blur?: boolean;
}

const MetricsHeader: FC<OwnProps> = async ({ chain }) => {
  const t = await getTranslations('NetworkProfileHeader');

  const isPow = chain?.consensusType === 'pow';
  const isMonero = isPow && chain.name === 'monero';

  const rows: MetricRow[] = [];

  const [price, moneroSnapshot, moneroBlockMetrics, moneroPoolStats] = await Promise.all([
    chain ? chainService.getTokenPriceByChainId(chain.id) : null,
    isMonero ? moneroService.getMoneroNetworkSnapshot() : null,
    isMonero ? moneroService.getMoneroBlockMetrics24h() : null,
    isMonero ? moneroService.getMoneroPoolStats('24h') : [],
  ]);

  const validatorCost =
    chain?.tokenomics?.activeSetMinAmount && price && chain?.params?.coinDecimals != null
      ? (Number(chain.tokenomics.activeSetMinAmount) / 10 ** Number(chain.params.coinDecimals)) * Number(price.value)
      : 0;

  const networkHashrateHps = Number(moneroSnapshot?.hashrate ?? 0);
  const averageRewardAtomic = moneroBlockMetrics?.averageRewardAtomic ?? null;
  const coinDecimals = chain?.params?.coinDecimals ?? null;
  const weightedPoolFee = weightedAverageFeePercent(
    moneroPoolStats
      .filter((stat) => stat.pool.isVerified && stat.pool.slug !== 'unknown')
      .map((stat) => ({ feePercent: stat.pool.feePercent, hashrateHps: Number(stat.hashrateEstimate) })),
  );
  const minerReturn =
    averageRewardAtomic !== null && coinDecimals !== null && price && weightedPoolFee !== null
      ? estimateMiningReturn({
          averageReward: atomicToDecimal(BigInt(averageRewardAtomic), coinDecimals),
          blockTimeSeconds: MONERO_BLOCK_TIME_SECONDS,
          minerHashrateHps: 1_000,
          networkHashrateHps,
          poolFeePercent: weightedPoolFee,
          tokenPriceUsd: price.value,
        })
      : null;

  if (isMonero) {
    rows.push({
      key: 'minimum miner profit',
      title: t('minimum miner profit'),
      data: minerReturn ? `$${formatCash(minerReturn.netUsdPerDay, 4)}/day` : '—',
      tooltip:
        minerReturn && weightedPoolFee !== null
          ? t('minimum miner profit tooltip', { fee: weightedPoolFee.toFixed(2) })
          : undefined,
      blur: !minerReturn,
    });
  } else {
    rows.push({
      key: 'validator cost',
      title: t('validator cost'),
      data: `$${formatCash(validatorCost)}`,
      tooltip: validatorCost?.toLocaleString(),
      blur: !validatorCost,
    });
  }

  for (const item of networkProfileExample.headerMetrics) {
    rows.push({
      key: item.title,
      title: t(item.title as 'tvl' | 'revenue' | 'mau'),
      data: String(item.data),
      blur: true,
    });
  }

  const containerBlur = !isPow && !rows.some((r) => !r.blur);

  return (
    <div className={containerBlur ? 'flex w-full flex-col gap-1 blur-sm' : 'flex w-full flex-col gap-1'}>
      {rows.map((row) => (
        <div
          key={row.key}
          className={`my-1 flex items-center justify-between rounded bg-card py-2 pl-10 pr-2 hover:text-highlight hover:shadow-[0px_6px_6px_0px_rgba(0,0,0,0.25),0px_4px_4px_0px_rgba(0,0,0,0.25),0px_4px_4px_0px_black] ${row.blur ? 'pointer-events-none blur-sm' : ''}`}
        >
          <span className="font-sfpro text-base">{row.title}</span>
          <div className="flex items-center">
            <span className="mr-8 font-handjet text-lg">
              {row.tooltip ? <Tooltip tooltip={row.tooltip}>{row.data}</Tooltip> : row.data}
            </span>
            <PlusButton size="xs" isOpened={false} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsHeader;
