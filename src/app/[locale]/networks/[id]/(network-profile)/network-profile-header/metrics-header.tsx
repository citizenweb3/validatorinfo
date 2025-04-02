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
    <div className="mt-16 flex w-full justify-center gap-6">
      {networkProfileExample.headerMetrics.map((item) => (
        <ToolTip key={item.title} tooltip={t('tvl tooltip')} direction={'top'}>
          <MetricsCardItem key={item.title}
                           title={t(item.title as 'tvl')}
                           data={item.data}
                           titleClassName="my-1"
                           isModal />
        </ToolTip>
      ))}
    </div>
  );
};

export default MetricsHeader;
