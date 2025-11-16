import { Chain } from '@prisma/client';
import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import { networkProfileExample } from '@/app/networks/[name]/(network-profile)/networkProfileExample';
import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';
import SubTitle from '@/components/common/sub-title';
import ToolTip from '@/components/common/tooltip';

interface OwnProps {
  chain: Chain;
}

const SocialStatistics: FC<OwnProps> = async ({ chain }) => {
  const t = await getTranslations('NetworkStatistics');

  return (
    <div className="mb-10 mt-10">
      <SubTitle text={t('Social')} />
      <div className="mx-auto mt-16 flex w-fit items-center justify-between px-4 py-1 shadow-button">
        <div className="font-sfpro text-lg">{t('price of active user')}:</div>
        <div className="ml-24 px-24 font-handjet text-xl text-highlight">$124.43K</div>
      </div>
      <div className="mt-12 flex w-full flex-row justify-center gap-6">
        <ToolTip tooltip={t('followers tooltip')} direction={'top'}>
          <MetricsCardItem
            title={t('followers')}
            data={chain.twitterFollowers ?? '-'}
            className={'pb-2 pt-2.5'}
            dataClassName={'my-5'}
          />
        </ToolTip>
        {networkProfileExample.socialMetrics.map((item) => (
          <ToolTip key={item.title} tooltip={'text'} direction={'top'}>
            <MetricsCardItem
              key={item.title}
              title={t(item.title as 'believers')}
              data={item.data}
              className={'pb-2 pt-2.5'}
              dataClassName={'my-5'}
            />
          </ToolTip>
        ))}
      </div>
    </div>
  );
};

export default SocialStatistics;
