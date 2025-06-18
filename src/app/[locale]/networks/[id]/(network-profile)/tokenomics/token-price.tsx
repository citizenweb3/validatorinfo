import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import SubTitle from '@/components/common/sub-title';
import RoundedButton from '@/components/common/rounded-button';
import { Tokenomics } from '@prisma/client';
import colorStylization from '@/utils/color-stylization';

interface OwnProps {
  denom: string | null;
  price: number | null;
  tokenomics: Tokenomics | null;
}

const NetworkTokenPrice: FC<OwnProps> = async ({ denom, price, tokenomics }) => {
  const t = await getTranslations('NetworkTokenomics');

  return (
    <div className="mb-20">
      <div className="flex flex-row justify-between items-end">
        <SubTitle text={t('Token Price')} />
        <RoundedButton className="flex text-lg" contentClassName="px-12">{t('Supply Concentration')}</RoundedButton>
      </div>
      <div className="flex flex-col mt-8">
        <div className="flex flex-row space-x-10 mt-6 mx-auto">
          <div className="flex items-center justify-between shadow-button space-x-24 py-1 pr-7 pl-2">
            <div className="font-sfpro text-lg">{`${denom ?? 'Coin'} / USD:`}</div>
            <div className="font-handjet text-xl text-highlight justify-end">{price && denom ? `$${price.toFixed(2)}` : ''}</div>
          </div>
          <div className="flex items-center justify-between shadow-button space-x-40 py-1 pr-7 pl-2">
            <div className="font-sfpro text-lg">ATH:</div>
            <div
              className="font-handjet text-xl text-highlight justify-end">{tokenomics?.ath ? `$${tokenomics?.ath.toFixed(2)}` : ''}</div>
          </div>
          <div className="flex items-center justify-between shadow-button space-x-40 py-1 pr-7 pl-2">
            <div className="font-sfpro text-lg">ATL:</div>
            <div
              className="font-handjet text-xl text-highlight justify-end">{tokenomics?.atl ? `$${tokenomics?.atl.toFixed(2)}` : ''}</div>
          </div>
        </div>
        <div className="flex flex-row mx-auto mt-8">
          <div
            className="flex flex-col justify-center items-center border-bgSt border-b border-r mx-8 px-6 font-handjet text-lg py-3">
            <div>24H</div>
            <div style={{ color: colorStylization.priceChanges(tokenomics?.changesPerDay ?? null) }}>
              {tokenomics?.changesPerDay ? `${tokenomics?.changesPerDay.toFixed(2)}%` : ''}
            </div>
          </div>
          <div
            className="flex flex-col justify-center items-center border-bgSt border-b border-r mx-8 px-6 font-handjet text-lg py-3">
            <div>1M</div>
            <div style={{ color: colorStylization.priceChanges(tokenomics?.changesPerMonth ?? null) }}>
              {tokenomics?.changesPerMonth ? `${tokenomics?.changesPerMonth.toFixed(2)}%` : ''}
            </div>
          </div>
          <div
            className="flex flex-col justify-center items-center border-bgSt border-b border-r mx-8 px-6 font-handjet text-lg py-3">
            <div>1Y</div>
            <div style={{ color: colorStylization.priceChanges(tokenomics?.changesPerYear ?? null) }}>
              {tokenomics?.changesPerYear ? `${tokenomics?.changesPerYear.toFixed(2)}%` : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkTokenPrice;
