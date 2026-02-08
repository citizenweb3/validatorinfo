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
    <div className="shrink-0 self-center">
      <div className="flex flex-row mt-8 gap-6">
        <div className="flex flex-col">
          <div className="flex items-center justify-between bg-table_row space-x-2 py-1 pr-7 pl-2">
            <div className="font-sfpro text-base">{`${denom ?? 'Coin'} / USD:`}</div>
            <div className="font-handjet text-lg text-highlight">{price && denom ? `$${price.toFixed(2)}` : ''}</div>
          </div>
          <div className="flex flex-row">
            <div className="flex flex-col justify-center items-center border-bgSt border-b border-r px-4 font-handjet text-base py-1">
              <div>24H</div>
              <div style={{ color: colorStylization.priceChanges(tokenomics?.changesPerDay ?? null) }}>
                {tokenomics?.changesPerDay ? `${tokenomics?.changesPerDay.toFixed(2)}%` : ''}
              </div>
            </div>
            <div className="flex flex-col justify-center items-center border-bgSt border-b border-r px-4 font-handjet text-base py-1">
              <div>1M</div>
              <div style={{ color: colorStylization.priceChanges(tokenomics?.changesPerMonth ?? null) }}>
                {tokenomics?.changesPerMonth ? `${tokenomics?.changesPerMonth.toFixed(2)}%` : ''}
              </div>
            </div>
            <div className="flex flex-col justify-center items-center border-bgSt border-b border-r px-4 font-handjet text-base py-1">
              <div>1Y</div>
              <div style={{ color: colorStylization.priceChanges(tokenomics?.changesPerYear ?? null) }}>
                {tokenomics?.changesPerYear ? `${tokenomics?.changesPerYear.toFixed(2)}%` : ''}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between bg-table_row space-x-28 py-1 pr-7 pl-2">
            <div className="font-sfpro text-base">ATH:</div>
            <div className="font-handjet text-lg text-highlight">{tokenomics?.ath ? `$${tokenomics?.ath.toFixed(2)}` : ''}</div>
          </div>
          <div className="flex items-center justify-between bg-table_row space-x-28 py-1 pr-7 pl-2">
            <div className="font-sfpro text-base">ATL:</div>
            <div className="font-handjet text-lg text-highlight">{tokenomics?.atl ? `$${tokenomics?.atl.toFixed(2)}` : ''}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkTokenPrice;
