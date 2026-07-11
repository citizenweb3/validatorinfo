import Link from 'next/link';
import { FC } from 'react';

import HashrateWindowSelector from '@/app/networks/[name]/(network-profile)/stats/hashrate-window-selector';
import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';
import SubTitle from '@/components/common/sub-title';
import Tooltip from '@/components/common/tooltip';
import { Locale } from '@/i18n';
import { HashrateWindow, MoneroPoolBlock } from '@/services/monero-service';
import cutHash from '@/utils/cut-hash';
import { formatHashrate } from '@/utils/format-hashrate';
import { getFreshMinersCount } from '@/utils/monero-pool-miners';

import type { MiningPoolStats } from '@prisma/client';

interface WindowOption {
  value: HashrateWindow;
  label: string;
}

interface MiningPoolMetricLabels {
  metricsTitle: string;
  hashrate: string;
  poolFee: string;
  blocksFound: string;
  marketShare: string;
  lastBlockFound: string;
  miners: string;
  minersUpdated: string;
  p2poolMiners: string;
  allTime: string;
  noData: string;
}

interface OwnProps {
  allTimeBlocks: number;
  chainName: string;
  currentWindow: HashrateWindow;
  currentWindowLabel: string;
  feePercent: number | null;
  isP2pool: boolean;
  labels: MiningPoolMetricLabels;
  lastBlock: MoneroPoolBlock | null;
  locale: Locale;
  minersCount: number | null;
  minersUpdatedAt: Date | null;
  stat: Pick<MiningPoolStats, 'blocksFound' | 'hashrateEstimate' | 'sharePercent'> | null;
  windowOptions: WindowOption[];
}

const formatCount = (value: number, locale: Locale): string => value.toLocaleString(locale);

const cardClassName = `
      pt-2.5
      sm:min-h-[45px]
      sm:min-h-[55px]
      md:min-h-[63px]
      lg:min-h-[75px]
      xl:min-h-[80px]
      2xl:min-h-[94px]`;
const cardValueClassName = 'mt-3 px-2 text-center leading-5';

const formatRelativeTime = (date: Date, locale: Locale): string => {
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return '-';

  const seconds = Math.floor(diffMs / 1000);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (seconds < 60) return formatter.format(-seconds, 'second');

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return formatter.format(-minutes, 'minute');

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return formatter.format(-hours, 'hour');

  const days = Math.floor(hours / 24);
  return formatter.format(-days, 'day');
};

const MiningPoolMetrics: FC<OwnProps> = ({
  allTimeBlocks,
  chainName,
  currentWindow,
  currentWindowLabel,
  feePercent,
  isP2pool,
  labels,
  lastBlock,
  locale,
  minersCount,
  minersUpdatedAt,
  stat,
  windowOptions,
}) => {
  const hashrateValue = stat ? formatHashrate(stat.hashrateEstimate) : labels.noData;
  const feeValue = feePercent != null ? feePercent.toFixed(2) : labels.noData;
  const blocksValue = stat ? formatCount(stat.blocksFound, locale) : labels.noData;
  const allTimeBlocksValue = `${currentWindowLabel} · ${formatCount(allTimeBlocks, locale)} ${labels.allTime}`;
  const shareValue = stat?.sharePercent != null ? stat.sharePercent.toFixed(2) : labels.noData;
  const freshMinersCount = getFreshMinersCount(minersCount, minersUpdatedAt);
  const minersValue = freshMinersCount !== null ? formatCount(freshMinersCount, locale) : labels.noData;
  const minersUpdatedLabel = freshMinersCount !== null && minersUpdatedAt
    ? `${labels.minersUpdated} ${formatRelativeTime(minersUpdatedAt, locale)}`
    : '';
  const minersTooltip = [isP2pool ? labels.p2poolMiners : '', minersUpdatedLabel].filter(Boolean).join('\n');

  const lastBlockValue = lastBlock ? (
    <Link
      href={`/networks/${chainName}/blocks/${lastBlock.blockHash}`}
      aria-label={`${labels.lastBlockFound} ${formatCount(lastBlock.height, locale)}`}
      className="underline underline-offset-3 hover:text-highlight"
    >
      #{formatCount(lastBlock.height, locale)}
    </Link>
  ) : (
    labels.noData
  );
  const lastBlockRelativeTime = lastBlock ? formatRelativeTime(lastBlock.blockTimestamp, locale) : '';
  const lastBlockTooltip = lastBlock ? `${cutHash({ value: lastBlock.blockHash })} · ${lastBlockRelativeTime}` : '';

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SubTitle text={labels.metricsTitle} />
        {windowOptions.length > 1 && <HashrateWindowSelector current={currentWindow} options={windowOptions} />}
      </div>

      <div className="mt-12 flex w-full flex-wrap justify-center gap-8">
        <MetricsCardItem
          title={labels.hashrate}
          data={hashrateValue}
          className={cardClassName}
          dataClassName={cardValueClassName}
        />
        <MetricsCardItem
          title={labels.poolFee}
          data={feeValue}
          isPercents={feePercent != null}
          className={cardClassName}
          dataClassName={cardValueClassName}
        />
        <Tooltip tooltip={allTimeBlocksValue}>
          <MetricsCardItem
            title={labels.blocksFound}
            data={blocksValue}
            className={cardClassName}
            dataClassName={cardValueClassName}
          />
        </Tooltip>
        <MetricsCardItem
          title={labels.marketShare}
          data={shareValue}
          isPercents={stat?.sharePercent != null}
          className={cardClassName}
          dataClassName={cardValueClassName}
        />
        <Tooltip tooltip={lastBlockTooltip}>
          <MetricsCardItem
            title={labels.lastBlockFound}
            data={lastBlockValue}
            className={cardClassName}
            dataClassName={cardValueClassName}
          />
        </Tooltip>
        <Tooltip tooltip={minersTooltip}>
          <MetricsCardItem
            title={labels.miners}
            data={minersValue}
            className={cardClassName}
            dataClassName={cardValueClassName}
          />
        </Tooltip>
      </div>
    </section>
  );
};

export default MiningPoolMetrics;
