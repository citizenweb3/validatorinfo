import { FC } from 'react';

import Button from '@/components/common/button';

interface OwnProps {
  activeMode: 'mining' | 'staking';
  ariaLabel: string;
  miningLabel: string;
  stakingLabel: string;
}

const CalculatorModeTabs: FC<OwnProps> = ({ activeMode, ariaLabel, miningLabel, stakingLabel }) => {
  return (
    <nav aria-label={ariaLabel} className="my-6 flex justify-center gap-3">
      <Button component="link" href="/stakingcalculator" isActive={activeMode === 'staking'}>
        {stakingLabel}
      </Button>
      <Button component="link" href="/stakingcalculator?mode=mining&network=monero" isActive={activeMode === 'mining'}>
        {miningLabel}
      </Button>
    </nav>
  );
};

export default CalculatorModeTabs;
