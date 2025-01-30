'use client';

import { Price } from '@prisma/client';
import React, { FC, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { getStakingRates } from '@/actions/staking';
import StakingResults from '@/app/staking_calculator/staking-results';
import { validatorNodesWithChainData } from '@/services/validator-service';
import { ChainItem, StakingRates } from '@/types';

interface OwnProps {
  node?: validatorNodesWithChainData;
  price?: Price;
}

const NodeStakingCalculator: FC<OwnProps> = ({ node, price }) => {
  const [chain, setChain] = useState<ChainItem | undefined>(undefined);
  const [stakingRates, setStakingRates] = useState<StakingRates | undefined>(undefined);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    (async () => {
      const rates = await getStakingRates();
      setStakingRates(rates);
    })();

    if (node && price) {
      setChain({
        id: 1,
        name: node.prettyName,
        asset: {
          name: node.prettyName,
          price: price.value,
          symbol: node.denom,
          isSymbolFirst: false,
        },
      });
    }
  }, [node, price]);

  const handleResetDate = () => {
    setSelectedDate(new Date());
  };

  if (!stakingRates) {
    return (
      <div className="flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  const iconSize = 'h-10 min-h-10 w-10 min-w-10';

  return (
    <div className="relative w-[600px]">
      <StakingResults values={stakingRates} chain={chain} />
      <div className="mt-3 flex items-center justify-between border-b border-bgSt">
        <div className="flex items-center">
          <div className="border-r border-bgSt">
            <div className={`${iconSize} mx-6 my-2 bg-calendar bg-contain`} />
          </div>
          <DatePicker
            selected={selectedDate}
            onChange={(date: Date | null) => {
              if (date) {
                setSelectedDate(date);
              }
            }}
            dateFormat="dd/MM/yyyy"
            popperClassName="custom-popper"
            className="ml-14 cursor-pointer bg-background font-handjet text-lg hover:text-highlight focus:outline-none active:text-base"
          />
        </div>
        <div
          onClick={handleResetDate}
          className={`${iconSize} cursor-pointer bg-reset bg-contain  hover:bg-reset_h active:bg-reset_a`}
        />
      </div>
    </div>
  );
};

export default NodeStakingCalculator;
