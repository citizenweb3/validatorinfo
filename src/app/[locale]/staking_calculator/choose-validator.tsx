'use client';

import { useTranslations } from 'next-intl';
import { FC, useEffect, useMemo, useState } from 'react';

import { getValidators } from '@/actions/validators';
import ChooseDropdown from '@/app/staking_calculator/choose-dropdown';
import { ValidatorItem } from '@/types';

interface OwnProps {
  value?: string | number;
  onChange: (value?: ValidatorItem) => void;
}

const ChooseValidator: FC<OwnProps> = ({ value, onChange }) => {
  const t = useTranslations('CalculatorPage');
  const [validators, setValidators] = useState<ValidatorItem[]>([]);
  useEffect(() => {
    const init = async () => {
      const vals = await getValidators();
      setValidators(vals);
    };
    init();
  }, []);

  const validatorList = useMemo(() => {
    return validators.map((v) => ({ value: v.operatorAddress, title: v.moniker }));
  }, [validators]);

  return (
    <ChooseDropdown
      name={t('Choose a Validator')}
      list={validatorList}
      selected={value}
      onChange={(value) => onChange(validators.find((v) => v.operatorAddress === value))}
    />
  );
};

export default ChooseValidator;
