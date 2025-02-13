import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import { networkProfileExample } from '@/app/networks/[id]/networkProfileExample';
import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';

interface OwnProps {
}

const TotalsListProposals: FC<OwnProps> = async () => {
  const t = await getTranslations('NetworkGovernance');

  return (
    <div className="mt-12 flex w-full flex-row justify-center gap-6">
      {networkProfileExample.totalsListProposals.map((item) => (
        <MetricsCardItem key={item.title}
                         title={t(item.title as 'total')}
                         data={item.data}
                         className={'pb-6 pt-2.5'}
                         dataClassName={'mt-5'} />
      ))}
    </div>
  );
};

export default TotalsListProposals;
