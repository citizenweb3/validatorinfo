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
  return (
    <div className="">
      <div className="">
        <span className="font-retro">{title}</span>d Earnings
      </div>
      <div className="font-retro text-highlight">
        {asset.isSymbolFirst && asset.symbol}
        {value.toFixed(asset.isSymbolFirst ? 2 : 6)}
        {!asset.isSymbolFirst && ' ' + asset.symbol}
      </div>
    </div>
  );
};

export default StakingResultsItem;
