'use client';

import { useTranslations } from 'next-intl';
import { FC, useState } from 'react';

import NodeDetailsItem from '@/app/validators/[id]/[operatorAddress]/validator_passport/authz/node-details/node-details-item';
import Switch from '@/components/common/switch';

interface OwnProps {
  commissionsAmount: number | null;
  denom: string;
  price: number | null;
  rewardsAmount: number | null;
}

const formatTokenAmount = (amount: number, denom: string): string =>
  `${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${denom}`.trim();

const formatUsdAmount = (amount: number, price: number): string =>
  `$${(amount * price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const CurrencyRewards: FC<OwnProps> = ({ commissionsAmount, denom, price, rewardsAmount }) => {
  const t = useTranslations('ValidatorPassportPage');
  const [isToken, setIsToken] = useState<boolean>(false);
  const canUsd = price !== null && price > 0;
  const showToken = !canUsd || isToken;
  const formatAmount = (amount: number | null): string => {
    if (amount === null) {
      return '-';
    }

    return showToken || price === null ? formatTokenAmount(amount, denom) : formatUsdAmount(amount, price);
  };

  return (
    <div>
      {canUsd && (
        <div className="mt-4 flex h-5 flex-row items-center justify-end space-x-2 text-lg uppercase">
          <div className="border-b border-bgSt px-2 font-handjet">USD</div>
          <Switch value={isToken} onChange={setIsToken} />
          <div className="border-b border-bgSt px-2 font-handjet">{t('token')}</div>
        </div>
      )}
      <NodeDetailsItem label={t('withdraw commission')} value={formatAmount(commissionsAmount)} />
      <NodeDetailsItem label={t('withdraw rewards')} value={formatAmount(rewardsAmount)} />
    </div>
  );
};

export default CurrencyRewards;
