'use client';

import { useTranslations } from 'next-intl';
import { FC } from 'react';

import SubTitle from '@/components/common/sub-title';
import BaseTable from '@/components/common/table/base-table';
import BaseTableCell from '@/components/common/table/base-table-cell';
import BaseTableHeaderCell from '@/components/common/table/base-table-header-cell';
import BaseTableRow from '@/components/common/table/base-table-row';
import { Locale } from '@/i18n';
import { cn } from '@/utils/cn';
import { formatHashrate } from '@/utils/format-hashrate';
import type { MiningTopPool } from '@/utils/mining-economics-context';

interface OwnProps {
  locale: Locale;
  pools: MiningTopPool[];
  selectedPoolSlug: string;
  topPoolsSharePercent: number | null;
  unattributedSharePercent: number | null;
}

const formatPercent = (value: number, locale: Locale): string =>
  `${value.toLocaleString(locale, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}%`;

const MiningTopPools: FC<OwnProps> = ({
  locale,
  pools,
  selectedPoolSlug,
  topPoolsSharePercent,
  unattributedSharePercent,
}) => {
  const t = useTranslations('MiningCalculatorPage');

  if (pools.length === 0) return null;

  return (
    <section aria-label={t('topPoolsTitle')}>
      <SubTitle text={t('topPoolsTitle')} />
      <div className="mt-6 overflow-x-auto">
        <BaseTable className="min-w-[680px]">
          <thead>
            <tr>
              <BaseTableHeaderCell className="px-2 py-2 text-sm">{t('topPoolName')}</BaseTableHeaderCell>
              <BaseTableHeaderCell className="px-2 py-2 text-sm">{t('topPoolShare')}</BaseTableHeaderCell>
              <BaseTableHeaderCell className="px-2 py-2 text-sm">{t('topPoolHashrate')}</BaseTableHeaderCell>
              <BaseTableHeaderCell className="px-2 py-2 text-sm">{t('topPoolFee')}</BaseTableHeaderCell>
            </tr>
          </thead>
          <tbody>
            {pools.map((pool) => {
              const isSelected = pool.slug === selectedPoolSlug;
              const share = `${pool.sharePercent.toLocaleString(locale, {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              })}%`;
              const fee =
                pool.feePercent === null
                  ? '—'
                  : `${pool.feePercent.toLocaleString(locale, {
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 2,
                    })}%`;

              return (
                <BaseTableRow
                  key={pool.slug}
                  className={cn(isSelected && 'bg-table_header ring-1 ring-inset ring-highlight')}
                >
                  <th scope="row" className="px-2 py-3 text-left font-sfpro text-base font-normal">
                    <span aria-current={isSelected ? 'true' : undefined} className="inline-flex items-center gap-2">
                      {pool.name}
                      {isSelected ? (
                        <span className="rounded border border-highlight px-1.5 py-0.5 text-xs text-highlight">
                          {t('selectedPool')}
                        </span>
                      ) : null}
                    </span>
                  </th>
                  <BaseTableCell className="px-2 py-3 text-right text-lg">{share}</BaseTableCell>
                  <BaseTableCell className="px-2 py-3 text-right text-lg">
                    {formatHashrate(pool.hashrateHps)}
                  </BaseTableCell>
                  <BaseTableCell className="px-2 py-3 text-right text-lg">{fee}</BaseTableCell>
                </BaseTableRow>
              );
            })}
          </tbody>
        </BaseTable>
      </div>
      {topPoolsSharePercent !== null && (
        <p className="mt-3 font-sfpro text-sm opacity-75">
          {unattributedSharePercent === null
            ? t('topPoolsCoverage', { share: formatPercent(topPoolsSharePercent, locale) })
            : t('topPoolsCoverageWithUnattributed', {
                share: formatPercent(topPoolsSharePercent, locale),
                unattributed: formatPercent(unattributedSharePercent, locale),
              })}
        </p>
      )}
    </section>
  );
};

export default MiningTopPools;
