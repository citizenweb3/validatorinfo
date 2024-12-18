import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import TotalsListItem from '@/app/global_pos/totals/totals-list-item';
import HeaderInfoService from '@/services/headerInfo-service';

interface OwnProps {}

const TotalsList: FC<OwnProps> = async () => {
  const t = await getTranslations('GlobalPosPage.Footer');
  const headerInfo = await HeaderInfoService.getValidatorsAndChains();

  const data = [
    { title: 'total validators', data: headerInfo.validators },
    { title: 'total networks', data: headerInfo.chains },
    { title: 'total pages', data: 234 },
    { title: 'total ecosystems', data: 1 },
  ];

  return (
    <div className="mt-24 flex w-full flex-row justify-between space-x-16 px-36">
      {data.map((item) => (
        <TotalsListItem key={item.title} title={t(item.title as 'total validators')} data={item.data} />
      ))}
    </div>
  );
};

export default TotalsList;
