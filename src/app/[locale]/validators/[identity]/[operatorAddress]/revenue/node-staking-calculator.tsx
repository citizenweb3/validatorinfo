'use client';

import { Price } from '@prisma/client';
import { FC, useEffect, useState } from 'react';

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

  useEffect(() => {
    (async () => {
      const r = await getStakingRates();
      setStakingRates(r);
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

  return (
    <div className="w-[600px]">
      {stakingRates ? (
        chain ? (
          <StakingResults values={stakingRates} chain={chain} />
        ) : (
          <StakingResults values={stakingRates} />
        )
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};
export default NodeStakingCalculator;
