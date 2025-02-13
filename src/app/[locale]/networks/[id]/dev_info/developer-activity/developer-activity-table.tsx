'use client';

import { useTranslations } from 'next-intl';
import { FC } from 'react';

import SlashingEventsItem from '@/app/validators/[id]/[operatorAddress]/revenue/slashing-events/slashing-events-item';
import { devActivityTableExampleInterface } from '@/app/networks/[id]/networkProfileExample';
import DeveloperActivityTableItem from '@/app/networks/[id]/dev_info/developer-activity/developer-activity-table-item';

interface OwnProps {
  items: devActivityTableExampleInterface[];
}

const DeveloperActivityTable: FC<OwnProps> = ({ items }) => {
  const t = useTranslations('NetworkDevInfo');

  return (
    <div>
      <table className="mt-4 w-full table-auto border-collapse">
        <thead>
        <tr className="bg-table_header text-sm font-bold">
          <th className="py-3">{t('Table.Block Height.name')}</th>
          <th className="py-3">{t('Table.Coins Slashed.name')}</th>
        </tr>
        </thead>
        <tbody>
        {items.map((item) => (
          <DeveloperActivityTableItem key={item.title} item={item} />
        ))}
        </tbody>
      </table>
    </div>
  );
};

export default DeveloperActivityTable;
