'use client';

import { Validator } from '@prisma/client';
import { FC, useEffect, useState } from 'react';

import { getStakingRates } from '@/actions/staking';
import ChooseNetwork from '@/app/staking_calculator/choose-network';
import ChooseValidator from '@/app/staking_calculator/choose-validator';
import StakingResults from '@/app/staking_calculator/staking-results';
import { ChainItem, StakingRates } from '@/types';

interface OwnProps {}

const Calculator: FC<OwnProps> = () => {
  const [chain, setChain] = useState<ChainItem | undefined>(undefined);
  const [validator, setValidator] = useState<Validator | undefined>(undefined);
  const [stakingRates, setStakingRates] = useState<StakingRates | undefined>(undefined);

  useEffect(() => {
    const init = async () => {
      if (chain && validator) {
        const r = await getStakingRates(chain.id, validator.identity);
        setStakingRates(r);
      }
    };
    init();
  }, [chain, validator]);

  return (
    <div>
      <div className="mt-4 flex flex-row space-x-24 text-lg">
        <ChooseNetwork value={chain?.id} onChange={setChain} />
        <ChooseValidator value={validator?.identity} onChange={setValidator} />
      </div>
      <div className="mt-4 flex">{chain && <StakingResults values={stakingRates} chain={chain} />}</div>
    </div>
  );
};

export default Calculator;
