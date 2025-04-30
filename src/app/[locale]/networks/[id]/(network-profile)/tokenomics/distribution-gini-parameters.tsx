import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import SubTitle from '@/components/common/sub-title';
import Image from 'next/image';
import nodeService from '@/services/node-service';
import { networkProfileExample } from '@/app/networks/[id]/(network-profile)/networkProfileExample';
import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';

interface OwnProps {
  chainId: number;
}

const DistributionGiniParameters: FC<OwnProps> = async ({ chainId }) => {
  const t = await getTranslations('NetworkTokenomics');
  const nodes = await nodeService.getNodesByChainId(chainId);

  return (
    <div className="mt-6 mb-16">
      <div className="grid grid-cols-2">
        <div className="flex flex-col">
          <SubTitle text={t('Distribution')} />
          <div className="flex mt-5 ml-40">
            <Image
              src={'/img/charts/distribution-circle-chart.svg'}
              width={350}
              height={250}
              alt="distribution"
            />
          </div>
        </div>
        <div>
          <SubTitle text={t('Gini Coefficient')} />
          <div className="flex flex-row mt-9 ml-20">
            <Image
              src={'/img/charts/gini-coefficient.svg'}
              width={190}
              height={200}
              alt="distribution"
              className="mr-5"
            />
            <div className="flex flex-col justify-center">
              <div className="font-sfpro text-base">{t('number of validators')}</div>
              <div className="font-handjet text-lg text-highlight">{nodes?.length ?? '234'}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-24 flex w-full flex-row justify-center gap-8">
        {networkProfileExample.distributionParameters.slice(0, 4).map((item) => (
          <MetricsCardItem key={item.title}
                           title={t(item.title as 'community pool tvl')}
                           data={item.data}
                           className={'pb-8 pt-2.5'}
                           dataClassName={'mt-6'} />
        ))}
      </div>
      <div className="mt-8 flex w-full flex-row justify-center gap-8">
        {networkProfileExample.distributionParameters.slice(4, 6).map((item) => (
          <MetricsCardItem key={item.title}
                           title={t(item.title as 'circulating tokens')}
                           data={item.data}
                           className={'pb-8 pt-2.5'}
                           dataClassName={'mt-6'} />
        ))}
      </div>
    </div>

  );
};

export default DistributionGiniParameters;
