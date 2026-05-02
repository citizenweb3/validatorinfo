'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FC, useTransition } from 'react';

import Switch from '@/components/common/switch';

interface ValidatorModeToggleProps {
  mode: 'simple' | 'dev';
}

const ValidatorModeToggle: FC<ValidatorModeToggleProps> = ({ mode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('HomePage');
  const [isPending, startTransition] = useTransition();

  const isDevMode = mode === 'dev';

  const handleModeToggle = (value: boolean) => {
    startTransition(() => {
      const newSp = new URLSearchParams(searchParams.toString());
      if (value) {
        newSp.set('mode', 'dev');
      } else {
        newSp.delete('mode');
      }
      router.replace(`${pathname}?${newSp.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="flex items-center" style={{ opacity: isPending ? 0.7 : 1 }}>
      <span className={`font-handjet text-lg ${!isDevMode ? 'text-highlight' : 'text-primary'}`}>
        {t('Game')}
      </span>
      <Switch value={isDevMode} onChange={handleModeToggle} />
      <span className={`font-handjet text-lg ${isDevMode ? 'text-highlight' : 'text-primary'}`}>
        {t('Dev')}
      </span>
    </div>
  );
};

export default ValidatorModeToggle;
