'use client';

import { useTranslations } from 'next-intl';
import { FC } from 'react';

import SubTitle from '@/components/common/sub-title';
import BaseTable from '@/components/common/table/base-table';
import BaseTableCell from '@/components/common/table/base-table-cell';
import BaseTableHeaderCell from '@/components/common/table/base-table-header-cell';
import BaseTableRow from '@/components/common/table/base-table-row';
import { Locale } from '@/i18n';
import type { MoneroMiningEconomics } from '@/services/mining-profitability-service';
import { formatCurrencyDecimal, formatDecimal } from '@/utils/format-decimal';
import { formatHashrate } from '@/utils/format-hashrate';

interface OwnProps {
  economics: MoneroMiningEconomics;
  locale: Locale;
}

interface TrendRowProps {
  change: string;
  current: string;
  label: string;
}

const TrendRow: FC<TrendRowProps> = ({ change, current, label }) => {
  return (
    <BaseTableRow>
      <th scope="row" className="px-2 py-2 text-left font-sfpro text-base font-normal">
        {label}
      </th>
      <BaseTableCell className="px-2 py-2 text-right text-lg">{current}</BaseTableCell>
      <BaseTableCell className="px-2 py-2 text-right text-lg">{change}</BaseTableCell>
    </BaseTableRow>
  );
};

const formatSignedPercent = (value: number, locale: Locale): string => {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
    signDisplay: 'always',
    style: 'percent',
  }).format(value);
};

const MiningNetworkTrend: FC<OwnProps> = ({ economics, locale }) => {
  const t = useTranslations('MiningCalculatorPage');
  const trend = economics.networkTrend;
  if (!trend) return null;

  return (
    <section aria-label={t('networkTrendTitle')}>
      <SubTitle text={t('networkTrendTitle')} />
      <div className="mt-6 overflow-x-auto">
        <BaseTable className="min-w-[520px]">
          <thead>
            <tr>
              <BaseTableHeaderCell className="px-2 py-2 text-sm">{t('trendMetric')}</BaseTableHeaderCell>
              <BaseTableHeaderCell className="px-2 py-2 text-sm">{t('trendCurrent')}</BaseTableHeaderCell>
              <BaseTableHeaderCell className="px-2 py-2 text-sm">{t('trendChange')}</BaseTableHeaderCell>
            </tr>
          </thead>
          <tbody>
            <TrendRow
              label={t('difficulty')}
              current={BigInt(economics.networkDifficulty).toLocaleString(locale)}
              change={formatSignedPercent(trend.difficultyChange, locale)}
            />
            <TrendRow
              label={t('networkHashrate')}
              current={formatHashrate(economics.networkHashrateHps)}
              change={formatSignedPercent(trend.hashrateChange, locale)}
            />
            <TrendRow
              label={t('xmrPrice')}
              current={formatCurrencyDecimal(economics.tokenPriceUsd, locale)}
              change={formatSignedPercent(trend.priceChange, locale)}
            />
            <TrendRow label={t('blocksPerHour')} current={formatDecimal(trend.blocksPerHour, locale)} change="—" />
          </tbody>
        </BaseTable>
      </div>
      <p className="mt-3 font-sfpro text-sm opacity-75">{t('trendBasedOnDays', { days: trend.windowDays })}</p>
    </section>
  );
};

export default MiningNetworkTrend;
