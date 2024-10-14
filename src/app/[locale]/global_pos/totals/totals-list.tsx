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
    { title: 'total ecosystems', data: 23 },
    { title: 'unknown', data: 0 },
  ];

  return (
    <div className="mt-9 flex flex-row space-x-16">
      {data.map((item) => (
        <TotalsListItem key={item.title} title={t(item.title as 'unknown')} data={item.data} />
      ))}
    </div>
  );
};

export default TotalsList;
