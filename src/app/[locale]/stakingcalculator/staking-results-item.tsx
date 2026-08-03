import { useLocale, useTranslations } from 'next-intl';
import { FC } from 'react';

import { formatDecimal } from '@/utils/format-decimal';

interface OwnProps {
  title: string;
  value: number;
  asset: {
    name: string;
    symbol: string;
    isSymbolFirst: boolean;
  };
}

const StakingResultsItem: FC<OwnProps> = ({ title, value, asset }) => {
  const locale = useLocale();
  const t = useTranslations('CalculatorPage');
  const formattedValue = asset.isSymbolFirst
    ? value.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : formatDecimal(value, locale);

  return (
    <div>
      <div className="text-nowrap text-base font-bold">
        <span className="font-handjet">{title}</span>
        {t('earnings')}
      </div>
      <div className="font-handjet text-lg text-highlight">
        {asset.isSymbolFirst && asset.symbol}
        {formattedValue}
        {!asset.isSymbolFirst && ' ' + asset.symbol}
      </div>
    </div>
  );
};

export default StakingResultsItem;
