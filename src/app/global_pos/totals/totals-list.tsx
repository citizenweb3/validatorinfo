import { FC } from 'react';

import TotalsListItem from '@/app/global_pos/totals/totals-list-item';

const getData = () => [
  { title: 'Total amount of validators', data: '2345' },
  { title: 'Total amount of networks', data: '547' },
  { title: 'Total Amount of Claimed Val. Pages', data: '234' },
  { title: 'Total Amount of Ecosystems', data: '23' },
  { title: '...', data: '...' },
];

const TotalsList: FC = () => {
  const data = getData();
  return (
    <div className="mt-9 flex flex-row space-x-16">
      {data.map((item) => (
        <TotalsListItem key={item.title} title={item.title} data={item.data} />
      ))}
    </div>
  );
};

export default TotalsList;
