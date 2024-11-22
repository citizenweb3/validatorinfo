'use client';

import { useTranslations } from 'next-intl';
import { FC, useState } from 'react';

import StakingResultsItem from '@/app/staking_calculator/staking-results-item';
import Switch from '@/components/common/switch';
import { ChainItem } from '@/types';

interface OwnProps {
  chain?: ChainItem;
  values: {
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

  const asset = isToken && chain ? chain.asset : usdtAsset;
  const price = +amount / asset.price;

  return (
    <div className="group/button w-full min-w-9 border-r border-t border-bgSt fill-black stroke-black p-6 pt-4 shadow-button">
      <div className="flex h-5 flex-row items-center justify-end space-x-2 text-lg uppercase">
        <div className="border-b border-bgSt px-2 font-handjet font-light">USD</div>
        <Switch value={isToken} onChange={(value) => setIsToken(value)} />
        <div className="border-b border-bgSt px-2 font-handjet font-light">{t('Token')}</div>
      </div>
      <div className="mt-3 font-bold">{t('Enter Staking Amount')}</div>
      <div className="relative mt-1">
        <div className="absolute left-2 top-1 font-handjet text-xl text-highlight">$</div>
        <input
          className="w-full bg-bgSt py-2 pl-5 pr-1 text-right outline-white"
          defaultValue={1000}
          placeholder="1000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      {isNaN(+amount) ? (
        <div className="mt-3 text-primary">{t('Wrong amount')}</div>
      ) : (
        <div className="mt-2.5 flex w-full justify-between">
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
