import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import { networkProfileExample } from '@/app/networks/[id]/(network-profile)/networkProfileExample';
import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';
import formatCash from '@/utils/format-cash';
import { ChainWithParamsAndTokenomics } from '@/services/chain-service';

interface OwnProps {
  chain: ChainWithParamsAndTokenomics | null;
}

const TotalsListNetworkPassport: FC<OwnProps> = async ({ chain }) => {
  const t = await getTranslations('NetworkPassport');
  const totalSupply = Number(chain?.tokenomics?.totalSupply) / Number(10 ** (chain?.params?.coinDecimals ?? 6));
  const totalSupplyMetric = `${formatCash(totalSupply)} ${chain?.params?.denom ?? ''}`;

  return (
    <div className="mt-20 flex w-full flex-row justify-center gap-6">
      <MetricsCardItem title={t('amount of wallets')}
                       data={chain?.walletsAmount?.toLocaleString() ?? '3 500 000'}
                       className={'pb-6 pt-2.5'}
                       dataClassName={'mt-5'} />
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
