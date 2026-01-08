'use client';

import { useTranslations } from 'next-intl';
import { FC } from 'react';

import SlashingEventsItem from '@/app/validators/[id]/[operatorAddress]/revenue/slashing-events/slashing-events-item';
import {
  SlashingEventsExampleInterface,
} from '@/app/validators/[id]/[operatorAddress]/revenue/slashing-events/slashingEventsExample';
import { AztecSlashingEventDisplay } from '@/app/validators/[id]/[operatorAddress]/revenue/slashing-events/aztec-slashing-types';

interface OwnProps {
  items: SlashingEventsExampleInterface[] | AztecSlashingEventDisplay[];
}

const SlashingEventsTable: FC<OwnProps> = ({ items }) => {
  const t = useTranslations('NodeRevenuePage');

  const isAztecData = items.length > 0 && 'transactionHash' in items[0];

  return (
    <div>
      <table className="mt-11 w-full table-auto border-collapse">
        <thead>
        <tr className="bg-table_header text-sm font-bold">
          <th className="py-3">
            {isAztecData ? t('Table.Block.name') : t('Table.Retro Name.name')}
          </th>
          <th className="py-3">
            {isAztecData ? t('Table.Amount Slashed.name') : t('Table.Commits.name')}
          </th>
        </tr>
        </thead>
        <tbody>
        {items.map((item, index) => {
          const key = 'transactionHash' in item
            ? `${item.transactionHash}-${index}`
            : (item as SlashingEventsExampleInterface).retroName.height;
          return <SlashingEventsItem key={key} item={item} />;
        })}
        </tbody>
      </table>
    </div>
  );
};

export default SlashingEventsTable;
