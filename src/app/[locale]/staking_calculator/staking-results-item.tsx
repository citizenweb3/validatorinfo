import { useTranslations } from 'next-intl';
import { FC } from 'react';

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
  const t = useTranslations('CalculatorPage');
  return (
    <div>
      <div className="text-nowrap text-lg">
        <span className="font-handjet">{title}</span>
        {t('earnings')}
      </div>
      <div className="font-handjet text-lg text-highlight">
        {asset.isSymbolFirst && asset.symbol}
        {value.toFixed(asset.isSymbolFirst ? 2 : 6)}
        {!asset.isSymbolFirst && ' ' + asset.symbol}
      </div>
    </div>
  );
};

export default StakingResultsItem;
