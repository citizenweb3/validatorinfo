import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import ToolTip from '@/components/common/tooltip';
import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';
import { networkProfileExample } from '@/app/networks/[id]/(network-profile)/networkProfileExample';
import { Chain } from '@prisma/client';

interface OwnProps {
  chain: Chain | null;
}

const MetricsHeader: FC<OwnProps> = async ({ chain }) => {
  const t = await getTranslations('NetworkProfileHeader');

  return (
    <div className="mt-16 flex w-full justify-center gap-5">
      {networkProfileExample.headerMetrics.map((item) => (
        <ToolTip key={item.title} tooltip={t('tvl tooltip')} direction={'top'}>
          <MetricsCardItem key={item.title}
                           title={t(item.title as 'tvl')}
                           data={item.data}
                           titleClassName="my-1"
                           className="
                           xs:w-[70px]
                           sm:w-[80px]
                           md:w-[120px]
                           lg:w-[140px]
                           xl:w-[150px]
                           2xl:w-[190px]"
                           isModal />
        </ToolTip>
      ))}
    </div>
  );
};

export default MetricsHeader;
