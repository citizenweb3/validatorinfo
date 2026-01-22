'use client';

import { useTranslations } from 'next-intl';
import { FC } from 'react';

import SlashingEventsItem from '@/app/validators/[id]/[operatorAddress]/revenue/slashing-events/slashing-events-item';
import BaseTable from '@/components/common/table/base-table';
import {
  SlashingEventsExampleInterface,
} from '@/app/validators/[id]/[operatorAddress]/revenue/slashing-events/slashingEventsExample';
import { AztecSlashingEventDisplay } from '@/app/validators/[id]/[operatorAddress]/revenue/slashing-events/aztec-slashing-types';

interface OwnProps {
  items: SlashingEventsExampleInterface[] | AztecSlashingEventDisplay[];
  showValidatorColumns?: boolean;
}

const SlashingEventsTable: FC<OwnProps> = ({ items, showValidatorColumns = false }) => {
  const t = useTranslations('NodeRevenuePage');

  if (items.length === 0) {
    return (
      <div className="mt-4 rounded-lg p-6 text-center">
        {t('no-slashing-events')}
      </div>
    );
  }

  const isAztecData = 'transactionHash' in items[0];

  return (
    <div>
      <BaseTable className="mt-11">
        <thead>
        <tr className="bg-table_header text-sm font-bold">
          <th className="py-3">
            {isAztecData ? t('Table.Block.name') : t('Table.Retro Name.name')}
          </th>
          <th className="py-3">
            {isAztecData ? t('Table.Amount Slashed.name') : t('Table.Commits.name')}
          </th>
          {isAztecData && showValidatorColumns && (
            <>
              <th className="py-3">{t('Table.Validator.name')}</th>
              <th className="py-3">{t('Table.Sequencer.name')}</th>
            </>
          )}
        </tr>
        </thead>
        <tbody>
        {items.map((item, index) => {
          const key = 'transactionHash' in item
            ? `${item.transactionHash}-${index}`
            : (item as SlashingEventsExampleInterface).retroName.height;
          return <SlashingEventsItem key={key} item={item} showValidatorColumns={showValidatorColumns} />;
        })}
        </tbody>
      </BaseTable>
    </div>
  );
};

export default SlashingEventsTable;
