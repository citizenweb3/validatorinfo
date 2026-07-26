import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import { networkProfileExample } from '@/app/networks/[name]/(network-profile)/networkProfileExample';
import PlusButton from '@/components/common/plus-button';
import Tooltip from '@/components/common/tooltip';
import chainService, { ChainWithParamsAndTokenomics } from '@/services/chain-service';
import miningProfitabilityService from '@/services/mining-profitability-service';
import formatCash from '@/utils/format-cash';
import { estimateMiningReturn } from '@/utils/mining-revenue';

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

  const [price, miningEconomics] = await Promise.all([
    chain && !isMonero ? chainService.getTokenPriceByChainId(chain.id) : null,
    isMonero ? miningProfitabilityService.getMoneroMiningEconomics(chain) : null,
  ]);

  const validatorCost =
    chain?.tokenomics?.activeSetMinAmount && price && chain?.params?.coinDecimals != null
      ? (Number(chain.tokenomics.activeSetMinAmount) / 10 ** Number(chain.params.coinDecimals)) * Number(price.value)
      : 0;

  const minerReturn = miningEconomics
    ? estimateMiningReturn({
        averageReward: miningEconomics.averageReward,
        blockTimeSeconds: miningEconomics.blockTimeSeconds,
        minerHashrateHps: 1_000,
        networkHashrateHps: miningEconomics.networkHashrateHps,
        poolFeePercent: miningEconomics.weightedPoolFeePercent,
        tokenPriceUsd: miningEconomics.tokenPriceUsd,
      })
    : null;

  if (isMonero) {
    rows.push({
      key: 'minimum miner profit',
      title: t('minimum miner profit'),
      data: minerReturn ? `$${formatCash(minerReturn.netUsdPerDay, 4)}/day` : '—',
      tooltip:
        minerReturn && miningEconomics
          ? t('minimum miner profit tooltip', { fee: miningEconomics.weightedPoolFeePercent.toFixed(2) })
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
