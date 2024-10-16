import { useTranslations } from 'next-intl';
import { FC } from 'react';

import TotalsListItem from '@/app/global_pos/totals/totals-list-item';

interface OwnProps {
  data: { title: string; data: number }[];
}

const TotalsList: FC<OwnProps> = ({ data }) => {
  const t = useTranslations('GlobalPosPage.Footer');
  return (
    <div className="mt-9 flex flex-row space-x-16">
      {data.map((item) => (
        <TotalsListItem key={item.title} title={t(item.title as 'unknown')} data={item.data} />
      ))}
    </div>
  );
};

export default TotalsList;
