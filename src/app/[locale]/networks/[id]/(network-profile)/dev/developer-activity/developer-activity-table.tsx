'use client';

import { useTranslations } from 'next-intl';
import { FC } from 'react';

import { devActivityTableExampleInterface } from '@/app/networks/[id]/(network-profile)/networkProfileExample';
import DeveloperActivityTableItem
  from '@/app/networks/[id]/(network-profile)/dev/developer-activity/developer-activity-table-item';

interface OwnProps {
  items: devActivityTableExampleInterface[];
}

const DeveloperActivityTable: FC<OwnProps> = ({ items }) => {
  const t = useTranslations('NetworkDevInfo.DeveloperActivity');

  return (
    <div>
      <table className="mt-4 w-full table-auto border-collapse">
        <thead>
        <tr className="bg-table_header text-sm font-bold">
          <th className="py-3">{t('Table.Repository Name.name')}</th>
          <th className="py-3">{t('Table.Commits.name')}</th>
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
