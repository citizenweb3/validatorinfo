import { getTranslations } from 'next-intl/server';
import { FC } from 'react';
import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';
import { txExample } from '@/app/networks/[name]/tx/txExample';
import { isAztecChainName } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';

interface OwnProps {
  chainName: string;
}

const TotalTxsMetrics: FC<OwnProps> = async ({ chainName }) => {
  const t = await getTranslations('TotalTxsPage');

  const formatData = (title: string, data: number | string) => {
    switch (title) {
      case 'tps':
        return `${data} txs/s`;
      case 'average fee':
        return `${data} USD/tx`;
      default:
        return `${data.toLocaleString('en-En')}`;
    }
  };

  if (isAztecChainName(chainName)) {
    return (
      <div className="mt-8 flex w-full flex-row justify-center gap-3">
        {txExample.totalTxsMetrics.map((item) => (
          <MetricsCardItem
            key={item.title}
            title={t(item.title as 'total transactions')}
            data="N/A"
            className="pb-6 pt-2.5"
            dataClassName="mt-5"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-8 flex w-full flex-row justify-center gap-3">
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
