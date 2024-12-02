'use client';

import { FC, useEffect, useState } from 'react';

import { getStakingRates } from '@/actions/staking';
import { DropdownListItem } from '@/app/staking_calculator/choose-dropdown';
import ChooseNetwork from '@/app/staking_calculator/choose-network';
import ChooseValidator from '@/app/staking_calculator/choose-validator';
import StakingResults from '@/app/staking_calculator/staking-results';
import Button from '@/components/common/button';
import RoundedButton from '@/components/common/rounded-button';
import { ChainItem, StakingRates } from '@/types';

interface OwnProps {
  validatorsList: DropdownListItem[];
}

const Calculator: FC<OwnProps> = ({ validatorsList }) => {
  const [chain, setChain] = useState<ChainItem | undefined>(undefined);
  const [validator, setValidator] = useState<string | undefined>(undefined);
  const [stakingRates, setStakingRates] = useState<StakingRates | undefined>(undefined);

  useEffect(() => {
    (async () => {
      const r = await getStakingRates(chain?.id, validator);
      setStakingRates(r);
    })();
  }, [chain, validator]);

  const handleValidatorChange = (value?: string) => {
    setValidator(value?.toString() ?? '');
  };

  return (
    <div>
      <div className="mt-4 flex flex-row space-x-12 text-lg">
        <div className="flex-[2]">
          <ChooseNetwork value={chain?.id} onChange={setChain} />
        </div>
        <div className="mt-4 flex flex-[3]">
          {stakingRates && <StakingResults values={stakingRates} chain={chain} />}
        </div>
        <div className="flex-[2] text-lg">
          <ChooseValidator value={validator} onChange={handleValidatorChange} list={validatorsList} />
          {validator && (
            <div className="flex flex-row justify-between">
              <Button className="relative z-20 h-16 w-9">
                <div className="min-h-8 min-w-8 bg-star bg-contain" />
              </Button>
              <div className="mt-4 flex flex-col items-end justify-end space-y-4">
                <RoundedButton>Compare</RoundedButton>
                <RoundedButton>Spread the world</RoundedButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calculator;
