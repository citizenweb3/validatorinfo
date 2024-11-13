'use client';

import { FC, useEffect, useState } from 'react';

import { getStakingRates } from '@/actions/staking';
import { DropdownListItem } from '@/app/staking_calculator/choose-dropdown';
import ChooseNetwork from '@/app/staking_calculator/choose-network';
import ChooseValidator from '@/app/staking_calculator/choose-validator';
import StakingResults from '@/app/staking_calculator/staking-results';
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
      if (chain && validator) {
        const r = await getStakingRates(chain.id, validator);
        setStakingRates(r);
      }
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
        <div className="mt-4 flex flex-[3]">{chain && <StakingResults values={stakingRates} chain={chain} />}</div>
        <div className="flex-[2] text-lg">
          <ChooseValidator value={validator} onChange={handleValidatorChange} list={validatorsList} />
          <div className="mt-3.5 flex flex-row justify-between">
            <RoundedButton>Compare</RoundedButton>
            <RoundedButton>Profile</RoundedButton>
          </div>
          <div className="mt-7 flex justify-center">
            <RoundedButton>Spread the world</RoundedButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
