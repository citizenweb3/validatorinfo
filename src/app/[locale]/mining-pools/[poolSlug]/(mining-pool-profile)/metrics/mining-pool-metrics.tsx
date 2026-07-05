import Link from 'next/link';
import { FC } from 'react';

import HashrateWindowSelector from '@/app/networks/[name]/(network-profile)/stats/hashrate-window-selector';
import PassportRow, { signalColors } from '@/components/common/passport-row';
import SubTitle from '@/components/common/sub-title';
import { Locale } from '@/i18n';
import { HashrateWindow, MoneroPoolBlock } from '@/services/monero-service';
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

const getShareColor = (sharePercent: number | null | undefined): string | undefined => {
  if (sharePercent === null || sharePercent === undefined) return undefined;
  if (sharePercent > 33) return signalColors.red;
  if (sharePercent >= 10) return signalColors.yellow;
  return signalColors.green;
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
        <PassportRow label={labels.hashrate} value={hashrateValue} />
        <PassportRow label={labels.poolFee} value={feeValue} />
        <PassportRow label={labels.blocksFound} value={blocksValue} />
        <PassportRow label={labels.marketShare} value={shareValue} color={getShareColor(stat?.sharePercent)} />
        <PassportRow label={labels.lastBlockFound} value={lastBlockValue} />
      </div>
    </section>
  );
};

export default MiningPoolMetrics;
