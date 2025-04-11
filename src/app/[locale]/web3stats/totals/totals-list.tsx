import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import HeaderInfoService from '@/services/headerInfo-service';
import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';

interface OwnProps {
}

const TotalsList: FC<OwnProps> = async () => {
  const t = await getTranslations('GlobalPosPage.Footer');
  const headerInfo = await HeaderInfoService.getValidatorsAndChains();

  const data = [
    { title: 'total validators', data: headerInfo.validators },
    { title: 'total networks', data: headerInfo.chains },
    { title: 'total pages', data: 234 },
    { title: 'total ecosystems', data: 2 },
  ];

  return (
    <div className="mt-10 flex w-full flex-row justify-between px-20">
      {data.map((item) => (
        <div key={item.title}>
          <MetricsCardItem key={item.title}
                           title={t(item.title as 'total validators')}
                           data={item.data}
                           className={'pb-6 pt-2.5'}
                           dataClassName={'mt-5'} />
        </div>
      ))}
    </div>
  );
};

export default TotalsList;
