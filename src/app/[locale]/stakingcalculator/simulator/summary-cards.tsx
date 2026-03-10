'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { FC } from 'react';

import icons from '@/components/icons';
import { SimulatorChainData } from '@/actions/simulator';

import { calculateReward } from './calculate-reward';

interface OwnProps {
  chains: SimulatorChainData[];
  stakeAmount: number;
  durationDays: number;
  isCompounding: boolean;
}

const SummaryCards: FC<OwnProps> = ({ chains, stakeAmount, durationDays, isCompounding }) => {
  const t = useTranslations('StakingSimulator');

  if (chains.length === 0) {
    return (
      <div className="py-4 text-center font-handjet text-lg text-primary">
        {t('Select networks to see projections')}
      </div>
    );
  }

  return (
    <div className="my-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {chains.map((chain) => {
        const reward = calculateReward(stakeAmount, chain.apr, durationDays, isCompounding);
        const rewardUsd = reward * chain.tokenPrice;

        return (
          <div
            key={chain.id}
            className="flex flex-col items-center bg-table_row p-4 shadow-md"
          >
            <div className="flex items-center gap-2">
              <Image
                src={chain.logoUrl || icons.AvatarIcon}
                alt={chain.prettyName}
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="font-handjet text-lg text-highlight">{chain.prettyName}</span>
            </div>
            <div className="mt-2 text-center text-base">
              <div className="text-primary">{t('Estimated Reward')}</div>
              <div className="font-handjet text-lg text-highlight">
                {reward.toFixed(4)} {chain.denom}
              </div>
              {chain.tokenPrice > 0 && (
                <div className="font-handjet text-base text-primary">
                  ${rewardUsd.toFixed(2)}
                </div>
              )}
            </div>
            <div className="mt-2 text-center text-base">
              <div className="text-primary">{t('APR')}</div>
              <div className="font-handjet text-lg">{chain.apr.toFixed(2)}%</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryCards;
