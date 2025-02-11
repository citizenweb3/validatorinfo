'use client';

import { useTranslations } from 'next-intl';
import { FC, Suspense, useEffect, useState } from 'react';

import SlashingEventsTable from '@/app/validators/[id]/[operatorAddress]/revenue/slashing-events/slashing-events-table';
import {
  SlashingEventsExampleInterface,
  getSlashingEventsExample,
} from '@/app/validators/[id]/[operatorAddress]/revenue/slashing-events/slashingEventsExample';
import RoundedButton from '@/components/common/rounded-button';

const SlashingEventsDropDown: FC = () => {
  const t = useTranslations('NodeRevenuePage');
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const [events, setEvents] = useState<SlashingEventsExampleInterface[] | undefined>(undefined);

  useEffect(() => {
    (async () => {
      const events = await getSlashingEventsExample();
      setEvents(events);
    })();
  }, []);

  const handleToggle = () => {
    setIsOpened((prev) => !prev);
  };

  if (!events) return null;

  return (
    <div>
      <div className="mb-8 flex items-center justify-end">
        <RoundedButton contentClassName={'text-base'} onClick={handleToggle}>
          {isOpened ? t('Hide Slashing Event') : t('Show Slashing Event')}
        </RoundedButton>
      </div>
      {isOpened && (
        <Suspense fallback={<div className="flex items-center justify-center">Loading...</div>}>
          <SlashingEventsTable events={events} />
        </Suspense>
      )}
    </div>
  );
};

export default SlashingEventsDropDown;
