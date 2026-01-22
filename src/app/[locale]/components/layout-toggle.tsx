'use client';

import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { FC, useTransition } from 'react';

import Switch from '@/components/common/switch';

const LayoutToggle: FC = () => {
  const t = useTranslations('HomePage');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentMode = searchParams.get('mode') || 'game';
  const isDevMode = currentMode === 'dev';

  const handleToggle = (value: boolean) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set('mode', 'dev');
      } else {
        params.delete('mode');
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="flex -mb-10 items-center" style={{ opacity: isPending ? 0.7 : 1 }}>
      <span className={`font-handjet text-lg ${!isDevMode ? 'text-highlight' : 'text-primary'}`}>{t('Game')}</span>
      <Switch value={isDevMode} onChange={handleToggle} />
      <span className={`font-handjet text-lg ${isDevMode ? 'text-highlight' : 'text-primary'}`}>{t('Dev')}</span>
    </div>
  );
};

export default LayoutToggle;
