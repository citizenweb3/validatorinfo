import { getTranslations } from 'next-intl/server';
import { FC } from 'react';
import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';
import { txExample } from '@/app/networks/[id]/tx/txExample';

interface OwnProps {
}

const TotalTxsMetrics: FC<OwnProps> = async () => {
  const t = await getTranslations('TotalTxsPage');

  const formatData = (title: string, data: number | string) => {
    switch (title) {
      case 'tps':
        return `${data} txs/s`;
      default:
        return `${data.toLocaleString('en-En')}`;
    }
  };

  return (
    <div className="mt-12 flex w-full flex-row justify-center gap-6">
      {txExample.totalTxsMetrics.map((item) => (
        <MetricsCardItem key={item.title}
                         title={t(item.title as 'total transactions')}
                         data={formatData(item.title, item.data)}
                         className={'pb-6 pt-2.5'}
                         dataClassName={'mt-5'} />
      ))}
    </div>
  );
};

export default TotalTxsMetrics;
