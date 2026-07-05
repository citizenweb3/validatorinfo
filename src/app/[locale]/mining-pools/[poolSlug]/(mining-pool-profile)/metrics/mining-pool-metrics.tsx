import Link from 'next/link';
import { FC, ReactNode } from 'react';

import HashrateWindowSelector from '@/app/networks/[name]/(network-profile)/stats/hashrate-window-selector';
import SubTitle from '@/components/common/sub-title';
import { Locale } from '@/i18n';
import { HashrateWindow, MoneroPoolBlock } from '@/services/monero-service';
import { cn } from '@/utils/cn';
import cutHash from '@/utils/cut-hash';
import { formatHashrate } from '@/utils/format-hashrate';

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
  allTime: string;
  noData: string;
}

interface OwnProps {
  allTimeBlocks: number;
  chainName: string;
  currentWindow: HashrateWindow;
  currentWindowLabel: string;
  feePercent: number | null;
  labels: MiningPoolMetricLabels;
  lastBlock: MoneroPoolBlock | null;
  locale: Locale;
  stat: Pick<MiningPoolStats, 'blocksFound' | 'hashrateEstimate' | 'sharePercent'> | null;
  windowOptions: WindowOption[];
}

interface MetricRowProps {
  label: string;
  value: ReactNode;
  valueClassName?: string;
}

const MetricRow: FC<MetricRowProps> = ({ label, value, valueClassName }) => (
  <div className="mt-2 grid min-h-[72px] w-full grid-cols-1 bg-table_row hover:bg-bgHover md:grid-cols-3">
    <div className="flex items-center border-b border-bgSt px-4 py-3 font-sfpro text-base md:border-r md:pl-8 md:text-lg">
      {label}
    </div>
    <div
      className={cn(
        'flex items-center gap-2 border-b border-bgSt px-4 py-3 font-handjet text-lg md:col-span-2 md:pl-6',
        valueClassName,
      )}
    >
      {value}
    </div>
  </div>
);

const formatCount = (value: number, locale: Locale): string => value.toLocaleString(locale);

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

const getShareClassName = (sharePercent: number | null | undefined): string | undefined => {
  if (sharePercent === null || sharePercent === undefined) return undefined;
  if (sharePercent > 33) return 'text-[#EB1616]';
  if (sharePercent >= 10) return 'text-[#E5C46B]';
  return 'text-[#4FB848]';
};

const MiningPoolMetrics: FC<OwnProps> = ({
  allTimeBlocks,
  chainName,
  currentWindow,
  currentWindowLabel,
  feePercent,
  labels,
  lastBlock,
  locale,
  stat,
  windowOptions,
}) => {
  const hashrateValue = stat ? formatHashrate(stat.hashrateEstimate) : labels.noData;
  const feeValue = feePercent != null ? `${feePercent.toFixed(2)}%` : labels.noData;
  const blocksValue = stat
    ? `${formatCount(stat.blocksFound, locale)} (${currentWindowLabel}) / ${formatCount(allTimeBlocks, locale)} ${
        labels.allTime
      }`
    : labels.noData;
  const shareValue = stat?.sharePercent != null ? `${stat.sharePercent.toFixed(2)}%` : labels.noData;

  const lastBlockValue = lastBlock ? (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <Link
        href={`/networks/${chainName}/blocks/${lastBlock.blockHash}`}
        aria-label={`${labels.lastBlockFound} ${formatCount(lastBlock.height, locale)}`}
        className="underline underline-offset-3 hover:text-highlight"
      >
        #{formatCount(lastBlock.height, locale)}
      </Link>
      <span className="font-sfpro text-sm opacity-80">{formatRelativeTime(lastBlock.blockTimestamp, locale)}</span>
      <span className="font-sfpro text-sm opacity-70">{cutHash({ value: lastBlock.blockHash })}</span>
    </div>
  ) : (
    labels.noData
  );

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SubTitle text={labels.metricsTitle} />
        {windowOptions.length > 1 && <HashrateWindowSelector current={currentWindow} options={windowOptions} />}
      </div>

      <div className="mt-4">
        <MetricRow label={labels.hashrate} value={hashrateValue} />
        <MetricRow label={labels.poolFee} value={feeValue} />
        <MetricRow label={labels.blocksFound} value={blocksValue} />
        <MetricRow label={labels.marketShare} value={shareValue} valueClassName={getShareClassName(stat?.sharePercent)} />
        <MetricRow label={labels.lastBlockFound} value={lastBlockValue} />
      </div>
    </section>
  );
};

export default MiningPoolMetrics;
