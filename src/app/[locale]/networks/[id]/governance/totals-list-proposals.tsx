import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import TotalsListItem from '@/app/global/totals/totals-list-item';
import { networkProfileExample } from '@/app/networks/[id]/networkProfileExample';

interface OwnProps {}

const TotalsListProposals: FC<OwnProps> = async () => {
  const t = await getTranslations('NetworkGovernance');

  return (
    <div className="mt-12 flex w-full flex-row justify-between space-x-16 px-64">
      {networkProfileExample.totalsListProposals.map((item) => (
        <TotalsListItem key={item.title} title={t(item.title as 'total')} data={item.data} />
      ))}
    </div>
  );
};

export default TotalsListProposals;
