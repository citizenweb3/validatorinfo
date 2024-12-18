'use client';

import { useTranslations } from 'next-intl';
import { FC, useState } from 'react';

import Switch from '@/components/common/switch';

interface OwnProps {}

const Switcher: FC<OwnProps> = () => {
  const [value, setValue] = useState<boolean>(false);
  const t = useTranslations('MetricsPage');

  return (
    <div className="mt-6 flex items-center">
      <div className="border-b border-primary px-2 pb-px font-handjet text-lg">{t('All Metrics')}</div>
      <Switch value={value} onChange={(v) => setValue(v)} />
      <div className="border-b border-primary px-2 pb-px font-handjet text-lg">{t('Our Metrics')}</div>
    </div>
  );
};

export default Switcher;
