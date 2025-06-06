import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import { networkProfileExample } from '@/app/networks/[id]/(network-profile)/networkProfileExample';
import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';
import { Chain } from '@prisma/client';
import formatCash from '@/utils/format-cash';

interface OwnProps {
  chain: Chain | null;
}

const TotalsListNetworkPassport: FC<OwnProps> = async ({ chain }) => {
  const t = await getTranslations('NetworkPassport');
  const totalSupply = Number(chain?.totalSupply) / Number(10 ** (chain?.coinDecimals ?? 6));
  const totalSupplyMetric = `${formatCash(totalSupply)} ${chain?.denom ?? ''}`;

  return (
    <div className="mt-20 flex w-full flex-row justify-center gap-6">
      {networkProfileExample.totalsMetrics.map((item) => (
        <MetricsCardItem key={item.title}
                         title={t(item.title as 'amount of wallets')}
                         data={item.data}
                         isPercents
                         className={'pb-6 pt-2.5'}
                         dataClassName={'mt-5'} />
      ))}
      <MetricsCardItem title={t('total supply')}
                       data={totalSupplyMetric}
                       className={'pb-6 pt-2.5'}
                       dataClassName={'mt-5'} />
    </div>
  );
};

export default TotalsListNetworkPassport;
