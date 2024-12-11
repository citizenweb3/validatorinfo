'use client';

import { useTranslations } from 'next-intl';
import { FC, useEffect, useMemo, useState } from 'react';

import { getChains } from '@/actions/chains';
import ChooseDropdown from '@/app/staking_calculator/choose-dropdown';
import { ChainItem } from '@/types';

interface OwnProps {
  value?: number;
  onChange: (value?: ChainItem) => void;
}

const ChooseNetwork: FC<OwnProps> = ({ value, onChange }) => {
  const t = useTranslations('CalculatorPage');
  const [chains, setChains] = useState<ChainItem[]>([]);
  useEffect(() => {
    const init = async () => {
      const chs = await getChains();
      setChains(chs);
    };
    init();
  }, []);

  const validatorList = useMemo(() => {
    return chains.map((v) => ({ value: v.id, title: v.name }));
  }, [chains]);

  return (
    <ChooseDropdown
      name={t('Choose a Network')}
      list={validatorList}
      selected={value}
      onChange={(value) => onChange(chains.find((v) => v.id === value))}
      modalClassName="min-w-56 max-w-96"
      className="flex-grow"
    />
  );
};

export default ChooseNetwork;
