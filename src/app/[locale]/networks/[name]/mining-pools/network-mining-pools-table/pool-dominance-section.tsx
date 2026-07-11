'use client';

import dynamic from 'next/dynamic';
import { FC } from 'react';

import SubTitle from '@/components/common/sub-title';
import type { MoneroPoolShareSeries } from '@/services/monero-service';
import type { PoolSharePeriod } from '@/utils/monero-pool-share';
import { getUniquePoolShareDates } from '@/utils/monero-pool-share';

const MIN_HISTORY_DAYS = 7;

const PoolDominanceChart = dynamic(() => import('./pool-dominance-chart'), {
  ssr: false,
  loading: () => <div aria-hidden className="h-[400px] w-full rounded bg-table_row" />,
});

export interface PoolDominancePeriodOption {
  value: PoolSharePeriod;
  label: string;
  ariaLabel: string;
}

interface OwnProps {
  series: MoneroPoolShareSeries[];
  locale: string;
  title: string;
  emptyMessage: string;
  notEnoughDataMessage: string;
  periodOptions: PoolDominancePeriodOption[];
}

const PoolDominanceSection: FC<OwnProps> = ({
  series,
  locale,
  title,
  emptyMessage,
  notEnoughDataMessage,
  periodOptions,
}) => {
  const historyDays = getUniquePoolShareDates(series).length;

  return (
    <section className="mt-10">
      <SubTitle text={title} />
      <div className="mt-6">
        {historyDays === 0 ? (
          <div className="flex h-24 items-center justify-center rounded bg-table_row font-sfpro text-base text-white/60">
            {emptyMessage}
          </div>
        ) : historyDays < MIN_HISTORY_DAYS ? (
          <div className="flex h-24 items-center justify-center rounded bg-table_row font-sfpro text-base text-white/60">
            {notEnoughDataMessage}
          </div>
        ) : (
          <PoolDominanceChart
            initialSeries={series}
            locale={locale}
            emptyMessage={emptyMessage}
            periodOptions={periodOptions}
          />
        )}
      </div>
    </section>
  );
};

export default PoolDominanceSection;
