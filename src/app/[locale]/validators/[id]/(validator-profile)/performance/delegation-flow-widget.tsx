import { FC } from 'react';
import { getTranslations } from 'next-intl/server';

import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';
import { cn } from '@/utils/cn';

interface OwnProps {
  totalDelegated: string;
  uniqueDelegators: number;
  netDelegationChange: number;
  selfDelegationRatio: number;
  locale: string;
}

const DelegationFlowWidget: FC<OwnProps> = async ({
  totalDelegated,
  uniqueDelegators,
  netDelegationChange,
  selfDelegationRatio,
  locale,
}) => {
  const t = await getTranslations('ValidatorPerformance');

  const isPositiveChange = netDelegationChange >= 0;
  const changeArrow = isPositiveChange ? '▲' : '▼';
  const changeColor = isPositiveChange ? 'text-secondary' : 'text-red';

  const cardClass = cn('pt-2.5 sm:min-h-[55px] md:min-h-[63px] lg:min-h-[75px] xl:min-h-[80px] 2xl:min-h-[94px]');
  const cardValueClass = 'mt-3';

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex w-full flex-wrap justify-center gap-8">
        <MetricsCardItem
          title={t('total delegated')}
          data={totalDelegated}
          className={cardClass}
          dataClassName={cardValueClass}
        />
        <MetricsCardItem
          title={t('unique delegators')}
          data={uniqueDelegators.toLocaleString(locale)}
          className={cardClass}
          dataClassName={cardValueClass}
        />
        <MetricsCardItem
          title={t('net change 30d')}
          data={
            <span className={changeColor}>
              {changeArrow} {Math.abs(netDelegationChange).toLocaleString(locale)}
            </span>
          }
          className={cardClass}
          dataClassName={cardValueClass}
        />
      </div>
      <div className="w-full max-w-md px-4">
        <div className="mb-1 flex justify-between text-sm">
          <span className="text-highlight">{t('self delegation ratio')}</span>
          <span className="font-handjet">{selfDelegationRatio.toFixed(1)}%</span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-table_header"
          role="progressbar"
          aria-valuenow={selfDelegationRatio}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t('self delegation ratio')}
        >
          <div
            className="h-full rounded-full bg-highlight transition-all"
            style={{ width: `${Math.min(selfDelegationRatio, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default DelegationFlowWidget;
