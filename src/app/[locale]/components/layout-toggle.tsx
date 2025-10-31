'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FC } from 'react';
import { useTranslations } from 'next-intl';

import Switch from '@/components/common/switch';

const LayoutToggle: FC = () => {
  const t = useTranslations('HomePage');
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentMode = searchParams.get('mode') || 'game';
  const isDevMode = currentMode === 'dev';

  const handleToggle = (value: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('mode', 'dev');
    } else {
      params.delete('mode');
    }
    router.replace(`?${params.toString()}`);
  };

  return (
    <div className="mr-6 mb-6 mt-4 flex items-center justify-end gap-3">
      <span className={`font-handjet text-lg ${!isDevMode ? 'text-highlight' : 'text-primary'}`}>{t('Game')}</span>
      <Switch value={isDevMode} onChange={handleToggle} />
      <span className={`font-handjet text-lg ${isDevMode ? 'text-highlight' : 'text-primary'}`}>{t('Dev')}</span>
    </div>
  );
};

export default LayoutToggle;

