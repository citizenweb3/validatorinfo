'use client';

import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { FC, useTransition } from 'react';

import Switch from '@/components/common/switch';

const TxStatusToggle: FC = () => {
  const t = useTranslations('TotalTxsPage');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const isShowPending = searchParams.get('status') === 'pending';

  const handleToggle = (value: boolean) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set('status', 'pending');
      } else {
        params.delete('status');
      }
      params.set('p', '1');
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="flex items-center" style={{ opacity: isPending ? 0.7 : 1 }}>
      <span className={`font-handjet text-lg ${!isShowPending ? 'text-highlight' : 'text-primary'}`}>
        {t('Confirmed')}
      </span>
      <Switch value={isShowPending} onChange={handleToggle} />
      <span className={`font-handjet text-lg ${isShowPending ? 'text-highlight' : 'text-primary'}`}>
        {t('Pending')}
      </span>
    </div>
  );
};

export default TxStatusToggle;
