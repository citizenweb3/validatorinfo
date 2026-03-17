'use client';

import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { FC, useTransition } from 'react';

import Switch from '@/components/common/switch';
import { cn } from '@/utils/cn';

const NetworkViewToggle: FC = () => {
  const t = useTranslations('ValidatorNetworksPage');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const isNodeView = searchParams.get('view') === 'node';

  const handleToggle = (value: boolean) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set('view', 'node');
      } else {
        params.delete('view');
        params.delete('networks');
      }
      params.set('p', '1');
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className={cn('flex items-center', isPending && 'opacity-70')}>
      <span className={`font-handjet text-lg ${!isNodeView ? 'text-highlight' : 'text-primary'}`}>
        {t('Validator')}
      </span>
      <Switch value={isNodeView} onChange={handleToggle} />
      <span className={`font-handjet text-lg ${isNodeView ? 'text-highlight' : 'text-primary'}`}>
        {t('Node')}
      </span>
    </div>
  );
};

export default NetworkViewToggle;
