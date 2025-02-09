import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import TotalsListItem from '@/app/global/totals/totals-list-item';
import { networkProfileExample } from '@/app/networks/[id]/networkProfileExample';

interface OwnProps {}

const TotalsListNetworkPassport: FC<OwnProps> = async () => {
  const t = await getTranslations('NetworkPassport');


  return (
    <div className="mt-24 flex w-full flex-row justify-between space-x-16 px-64">
      {networkProfileExample.totalsMetrics.map((item) => (
        <TotalsListItem key={item.title} title={t(item.title as 'amount of wallets')} data={item.data} isPercents />
      ))}
    </div>
  );
};

export default TotalsListNetworkPassport;
