import { FC } from 'react';
import { Tokenomics } from '@prisma/client';
import colorStylization from '@/utils/color-stylization';
import formatPrice from '@/utils/format-price';

interface OwnProps {
  denom: string | null;
  price: number | null;
  tokenomics: Tokenomics | null;
}

const NetworkTokenPrice: FC<OwnProps> = async ({ denom, price, tokenomics }) => {
  const hasPrice = price != null && price > 0;
  const hasChangesDay = tokenomics?.changesPerDay != null;
  const hasChangesMonth = tokenomics?.changesPerMonth != null;
  const hasChangesYear = tokenomics?.changesPerYear != null;
  const hasAth = tokenomics?.ath != null && tokenomics.ath > 0;
  const hasAtl = tokenomics?.atl != null && tokenomics.atl > 0;

  return (
    <div className="shrink-0 self-center">
      <div className="flex flex-row mt-8 gap-6">
        <div className="flex flex-col">
          <div className="flex items-center justify-between bg-table_row space-x-2 py-1 pr-7 pl-2">
            <div className="font-sfpro text-base">{`${denom ?? 'Coin'} / USD:`}</div>
            <div className={`font-handjet text-lg text-highlight ${!hasPrice ? 'blur-sm' : ''}`}>
              {hasPrice ? `$${formatPrice(price)}` : '$12.43K'}
            </div>
          </div>
          <div className="flex flex-row">
            <div className="flex flex-col justify-center items-center border-bgSt border-b border-r px-4 font-handjet text-base py-1">
              <div>24H</div>
              <div
                className={!hasChangesDay ? 'blur-sm' : ''}
                style={{ color: hasChangesDay ? colorStylization.priceChanges(tokenomics.changesPerDay) : undefined }}
              >
                {hasChangesDay ? `${tokenomics.changesPerDay!.toFixed(2)}%` : '23.07%'}
              </div>
            </div>
            <div className="flex flex-col justify-center items-center border-bgSt border-b border-r px-4 font-handjet text-base py-1">
              <div>1M</div>
              <div
                className={!hasChangesMonth ? 'blur-sm' : ''}
                style={{ color: hasChangesMonth ? colorStylization.priceChanges(tokenomics.changesPerMonth) : undefined }}
              >
                {hasChangesMonth ? `${tokenomics.changesPerMonth!.toFixed(2)}%` : '23.07%'}
              </div>
            </div>
            <div className="flex flex-col justify-center items-center border-bgSt border-b border-r px-4 font-handjet text-base py-1">
              <div>1Y</div>
              <div
                className={!hasChangesYear ? 'blur-sm' : ''}
                style={{ color: hasChangesYear ? colorStylization.priceChanges(tokenomics.changesPerYear) : undefined }}
              >
                {hasChangesYear ? `${tokenomics.changesPerYear!.toFixed(2)}%` : '23.07%'}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between bg-table_row space-x-28 py-1 pr-7 pl-2">
            <div className="font-sfpro text-base">ATH:</div>
            <div className={`font-handjet text-lg text-highlight ${!hasAth ? 'blur-sm' : ''}`}>
              {hasAth ? `$${formatPrice(tokenomics.ath)}` : '$12.43K'}
            </div>
          </div>
          <div className="flex items-center justify-between bg-table_row space-x-28 py-1 pr-7 pl-2">
            <div className="font-sfpro text-base">ATL:</div>
            <div className={`font-handjet text-lg text-highlight ${!hasAtl ? 'blur-sm' : ''}`}>
              {hasAtl ? `$${formatPrice(tokenomics.atl)}` : '$12.43K'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkTokenPrice;
