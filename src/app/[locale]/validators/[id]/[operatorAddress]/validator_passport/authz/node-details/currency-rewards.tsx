'use client';

import { useTranslations } from 'next-intl';
import { FC, useState } from 'react';

import NodeDetailsItem from '@/app/validators/[id]/[operatorAddress]/validator_passport/authz/node-details/node-details-item';
import Switch from '@/components/common/switch';

interface OwnProps {}

const CurrencyRewards: FC<OwnProps> = () => {
  const t = useTranslations('ValidatorPassportPage');
  const [isToken, setIsToken] = useState<boolean>(false);

  return (
    <div>
      <div className="mt-4 flex h-5 flex-row items-center justify-end space-x-2 text-lg uppercase">
        <div className="border-b border-bgSt px-2 font-handjet">USD</div>
        <Switch value={isToken} onChange={(value) => setIsToken(value)} />
        <div className="border-b border-bgSt px-2 font-handjet">{t('token')}</div>
      </div>
      <NodeDetailsItem label={t('withdraw commission')} value="$5.6K" />
      <NodeDetailsItem label={t('withdraw rewards')} value="$60.6K" />
    </div>
  );
};

export default CurrencyRewards;
