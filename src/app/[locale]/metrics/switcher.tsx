'use client';

import { useTranslations } from 'next-intl';
import { FC, useState } from 'react';

interface OwnProps {}

const Switcher: FC<OwnProps> = () => {
  const [value, setValue] = useState<boolean>(false);
  const t = useTranslations('MetricsPage');

  return (
    <div className="mt-6 flex items-center">
      <div className="border-b border-primary px-2 pb-px font-handjet text-lg">{t('All Metrics')}</div>
      <div
        onClick={() => setValue(!value)}
        className="relative mx-2 h-[1.25rem] w-8 cursor-pointer rounded-[0.3125rem] bg-highlight"
      >
        <div
          className={`${value ? 'left-0.5' : 'right-0.5'} absolute bottom-0.5 top-0.5 w-4 rounded-[0.1875rem] bg-background`}
        />
      </div>
      <div className="border-b border-primary px-2 pb-px font-handjet text-lg">{t('Our Metrics')}</div>
    </div>
  );
};

export default Switcher;
