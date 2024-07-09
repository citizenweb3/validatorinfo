'use client';

import { FC, useEffect, useMemo, useState } from 'react';

import { getValidators } from '@/actions/validators';
import ChooseDropdown from '@/app/staking_calculator/choose-dropdown';
import { ValidatorItem } from '@/types';

interface OwnProps {
  value?: number;
  onChange: (value?: ValidatorItem) => void;
}

const ChooseValidator: FC<OwnProps> = ({ value, onChange }) => {
  const [validators, setValidators] = useState<ValidatorItem[]>([]);
  useEffect(() => {
    const init = async () => {
      const vals = await getValidators();
      setValidators(vals);
    };
    init();
  }, []);

  const validatorList = useMemo(() => {
    return validators.map((v) => ({ value: v.id, title: v.name }));
  }, [validators]);

  return (
    <ChooseDropdown
      name="Choose a Validator"
      list={validatorList}
      selected={value}
      onChange={(value) => onChange(validators.find((v) => v.id === value))}
    />
  );
};

export default ChooseValidator;
