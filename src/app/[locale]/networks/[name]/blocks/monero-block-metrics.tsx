import { getTranslations } from 'next-intl/server';
import { FC, ReactNode } from 'react';

import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';
import Tooltip from '@/components/common/tooltip';
import type { Locale } from '@/i18n';
import { getMoneroBlockMetrics24h, getMoneroChainParams } from '@/services/monero-service';
import { avgRewardXmr, dominantVersion, reorgRate } from '@/utils/monero-block-metrics';
import { formatBytes } from '@/utils/monero';

interface OwnProps {
  chainName: string;
  locale: Locale;
}

const cardClassName = 'pb-8 pt-2.5';
const dataClassName = 'mt-6 px-2 text-center leading-5';
const mutedDataClassName = `${dataClassName} blur-sm`;
const addLineClassName = 'mt-1 font-sfpro text-sm leading-4 opacity-80';
const cardGridClassName =
  'mt-10 grid w-full grid-cols-[repeat(2,auto)] justify-center gap-6 md:grid-cols-[repeat(4,auto)]';

const formatReward = (value: number | null, denom: string): string | null => {
  if (value === null) return null;
  return `${value.toLocaleString('en-US', { maximumFractionDigits: 4, minimumFractionDigits: 2 })} ${denom}`;
};

const formatRate = (value: number): string => `${(value * 100).toFixed(2)}%`;

const formatSharePct = (value: number): string => `${value.toFixed(1)}%`;

const reorgRateClassName = (value: number | null): string => {
  if (value === null) return '';
  if (value <= 0.001) return 'text-[#4FB848]';
  if (value <= 0.01) return 'text-[#E5C46B]';
  return 'text-[#EB1616]';
};

const withTooltip = (value: string, tooltip: string | null): ReactNode => {
  if (!tooltip) return value;

  return (
    <Tooltip tooltip={tooltip}>
      <div className="text-center">{value}</div>
    </Tooltip>
  );
};

const MoneroBlockMetrics: FC<OwnProps> = async ({ chainName, locale }) => {
  if (chainName !== 'monero') return null;

  const t = await getTranslations({ locale, namespace: 'MoneroBlockMetrics' });
  const [metrics, params] = await Promise.all([getMoneroBlockMetrics24h(), getMoneroChainParams()]);
  const noData = t('notEnoughData');
  const denom = params?.denom ?? 'XMR';
  const coinDecimals = params?.coinDecimals ?? null;

  const reward = formatReward(avgRewardXmr(metrics?.averageRewardAtomic ?? null, coinDecimals), denom);
  const weight = metrics?.averageWeight ? formatBytes(metrics.averageWeight) : null;
  const version = dominantVersion(metrics?.versionCounts ?? []);
  const versionLabel = version ? t('versionLabel', { version: version.version }) : null;
  const versionShare = version ? formatSharePct(version.sharePct) : null;
  const versionTooltip =
    version && versionLabel && versionShare
      ? t('versionShare', { version: versionLabel, share: versionShare })
      : null;
  const reorg = metrics ? reorgRate(metrics.nonCanonicalBlocks, metrics.totalBlocks) : null;

  return (
    <div className={cardGridClassName}>
      <MetricsCardItem
        title={t('avgBlockReward')}
        data={reward ?? noData}
        className={cardClassName}
        dataClassName={reward ? dataClassName : mutedDataClassName}
      />
      <MetricsCardItem
        title={t('avgBlockWeight')}
        data={weight ?? noData}
        className={cardClassName}
        dataClassName={weight ? dataClassName : mutedDataClassName}
      />
      <MetricsCardItem
        title={t('consensusVersion')}
        data={versionLabel ? withTooltip(versionLabel, versionTooltip) : noData}
        className={cardClassName}
        dataClassName={versionLabel ? dataClassName : mutedDataClassName}
        addLineData={versionShare ?? ''}
        addLineClassName={addLineClassName}
      />
      <MetricsCardItem
        title={t('reorgRate')}
        data={reorg !== null ? formatRate(reorg) : noData}
        className={cardClassName}
        dataClassName={reorg !== null ? `${dataClassName} ${reorgRateClassName(reorg)}` : mutedDataClassName}
      />
    </div>
  );
};

export default MoneroBlockMetrics;
