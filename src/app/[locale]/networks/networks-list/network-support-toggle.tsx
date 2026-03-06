'use client';

import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { FC, useTransition } from 'react';

import Switch from '@/components/common/switch';

const NetworkSupportToggle: FC = () => {
  const t = useTranslations('NetworksPage');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const isShowAll = searchParams.get('show') === 'all';

  const handleToggle = (value: boolean) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set('show', 'all');
      } else {
        params.delete('show');
      }
      params.set('p', '1');
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="flex items-center" style={{ opacity: isPending ? 0.7 : 1 }}>
      <span className={`font-handjet text-lg ${!isShowAll ? 'text-highlight' : 'text-primary'}`}>{t('Active')}</span>
      <Switch value={isShowAll} onChange={handleToggle} />
      <span className={`font-handjet text-lg ${isShowAll ? 'text-highlight' : 'text-primary'}`}>{t('All')}</span>
    </div>
  );
};

export default NetworkSupportToggle;
