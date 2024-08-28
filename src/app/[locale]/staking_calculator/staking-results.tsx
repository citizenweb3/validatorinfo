'use client';

import { useTranslations } from 'next-intl';
import { FC, useState } from 'react';

import StakingResultsItem from '@/app/staking_calculator/staking-results-item';
import Switch from '@/components/common/switch';
import { ChainItem } from '@/types';

interface OwnProps {
  chain: ChainItem;
  values?: {
    d1: number;
    d7: number;
    d30: number;
    d365: number;
  };
}

const usdtAsset = {
  name: 'USDT',
  symbol: '$',
  price: 1,
  isSymbolFirst: true,
};

const StakingResults: FC<OwnProps> = ({ values, chain }) => {
  const t = useTranslations('CalculatorPage');
  const [amount, setAmount] = useState<string>('');
  const [isToken, setIsToken] = useState<boolean>(false);

  if (!values) {
    return <div className="mt-2.5 text-base">{t('Please select')}</div>;
  }

  const asset = isToken ? chain.asset : usdtAsset;
  const price = +amount / asset.price;

  return (
    <div className="border-b border-l border-bgSt p-4 text-base">
      <div className="ml-24 flex h-3 flex-row items-end text-xs uppercase">
        <div className="h-3">USD</div>
        <Switch value={isToken} onChange={(value) => setIsToken(value)} />
        <div className="h-3">{t('Token')}</div>
      </div>
      <div className="mt-3">{t('Enter Staking Amount')}</div>
      <div className="relative">
        <div className="font-hackernoon absolute left-1 top-0 text-highlight">$</div>
        <input
          className="bg-bgSt pl-5 pr-1 text-right outline-white"
          defaultValue={1000}
          placeholder="1000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      {isNaN(+amount) ? (
        <div className="mt-2.5 text-primary">{t('Wrong amount')}</div>
      ) : (
        <div className="mt-2.5 space-y-2.5">
          <StakingResultsItem title="1" value={price * values.d1} asset={asset} />
          <StakingResultsItem title="7" value={price * values.d7} asset={asset} />
          <StakingResultsItem title="30" value={price * values.d30} asset={asset} />
          <StakingResultsItem title="365" value={price * values.d365} asset={asset} />
        </div>
      )}
    </div>
  );
};

export default StakingResults;
