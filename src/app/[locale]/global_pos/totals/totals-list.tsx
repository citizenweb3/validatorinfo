import { useTranslations } from 'next-intl';
import { FC } from 'react';

import TotalsListItem from '@/app/global_pos/totals/totals-list-item';

const getData = () => [
  { title: 'total validators', data: '2345' },
  { title: 'total networks', data: '547' },
  { title: 'total pages', data: '234' },
  { title: 'total ecosystems', data: '23' },
  { title: 'unknown', data: '...' },
];

const TotalsList: FC = () => {
  const t = useTranslations('GlobalPosPage.Footer');
  const data = getData();
  return (
    <div className="mt-9 flex flex-row space-x-16">
      {data.map((item) => (
        <TotalsListItem key={item.title} title={t(item.title as 'unknown')} data={item.data} />
      ))}
    </div>
  );
};

export default TotalsList;
