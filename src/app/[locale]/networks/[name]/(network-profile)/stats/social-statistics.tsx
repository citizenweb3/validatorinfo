import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import { networkProfileExample } from '@/app/networks/[name]/(network-profile)/networkProfileExample';
import SubTitle from '@/components/common/sub-title';
import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';
import ToolTip from '@/components/common/tooltip';

interface OwnProps {}

const SocialStatistics: FC<OwnProps> = async ({}) => {
  const t = await getTranslations('NetworkStatistics');

  return (
    <div className="mb-10 mt-10">
      <SubTitle text={t('Social')} />
      <div className="mt-16 flex items-center justify-between px-4 py-1 shadow-button mx-auto w-fit">
        <div className="font-sfpro text-lg">{t('price of active user')}:</div>
        <div className="ml-24 px-24 font-handjet text-xl text-highlight">$124.43K</div>
      </div>
      <div className="mt-12 flex w-full flex-row justify-center gap-6">
        {networkProfileExample.socialMetrics.map((item) => (
          <ToolTip key={item.title} tooltip={'text'} direction={'top'}>
            <MetricsCardItem key={item.title}
                             title={t(item.title as 'believers')}
                             data={item.data}
                             className={'pb-2 pt-2.5'}
                             dataClassName={'mt-2'}
                             isModal
            />
          </ToolTip>
        ))}
      </div>
    </div>
  );
};

export default SocialStatistics;
