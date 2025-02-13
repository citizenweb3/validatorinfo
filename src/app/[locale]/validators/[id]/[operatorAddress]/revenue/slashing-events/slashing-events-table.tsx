'use client';

import { useTranslations } from 'next-intl';
import { FC } from 'react';

import SlashingEventsItem from '@/app/validators/[id]/[operatorAddress]/revenue/slashing-events/slashing-events-item';
import {
  SlashingEventsExampleInterface,
} from '@/app/validators/[id]/[operatorAddress]/revenue/slashing-events/slashingEventsExample';

interface OwnProps {
  items: SlashingEventsExampleInterface[];
}

const SlashingEventsTable: FC<OwnProps> = ({ items }) => {
  const t = useTranslations('NodeRevenuePage');

  return (
    <div>
      <table className="mt-4 w-full table-auto border-collapse">
        <thead>
        <tr className="bg-table_header text-sm font-bold">
          <th className="py-3">{t('Table.Retro Name.name')}</th>
          <th className="py-3">{t('Table.Commits.name')}</th>
        </tr>
        </thead>
        <tbody>
        {items.map((item) => (
          <SlashingEventsItem key={item.retroName.height} item={item} />
        ))}
        </tbody>
      </table>
    </div>
  );
};

export default SlashingEventsTable;
