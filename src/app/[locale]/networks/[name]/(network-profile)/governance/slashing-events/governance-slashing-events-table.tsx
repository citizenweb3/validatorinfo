'use client';

import { FC } from 'react';

import { AztecSlashingEventDisplay } from '@/app/validators/[id]/[operatorAddress]/revenue/slashing-events/aztec-slashing-types';
import SlashingEventsTable from '@/app/validators/[id]/[operatorAddress]/revenue/slashing-events/slashing-events-table';

interface OwnProps {
  items: AztecSlashingEventDisplay[];
}

const GovernanceSlashingEventsTable: FC<OwnProps> = ({ items }) => {
  return <SlashingEventsTable items={items} showValidatorColumns={true} />;
};

export default GovernanceSlashingEventsTable;
