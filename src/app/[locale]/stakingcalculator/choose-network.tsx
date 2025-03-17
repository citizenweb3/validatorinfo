'use client';

import { useTranslations } from 'next-intl';
import { FC, useMemo } from 'react';

import ChooseDropdown from '@/app/stakingcalculator/choose-dropdown';
import { ChainItem } from '@/types';

interface OwnProps {
  value?: number;
  onChange: (value?: ChainItem) => void;
  chains: ChainItem[];
}

const ChooseNetwork: FC<OwnProps> = ({ value, onChange, chains }) => {
  const t = useTranslations('CalculatorPage');

  const chainList = useMemo(() => {
    return chains.map((v) => ({ value: v.id, title: v.name }));
  }, [chains]);

  return (
    <ChooseDropdown
      name={t('Choose a Network')}
      list={chainList}
      selected={value}
      onChange={(value) => onChange(chains.find((v) => v.id === value))}
      modalClassName="min-w-80 max-w-96"
    />
  );
};

export default ChooseNetwork;
