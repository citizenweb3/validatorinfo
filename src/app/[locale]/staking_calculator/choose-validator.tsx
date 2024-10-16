'use client';

import { Validator } from '@prisma/client';
import { useTranslations } from 'next-intl';
import { FC, useEffect, useMemo, useState } from 'react';

import { getValidators } from '@/actions/validators';
import ChooseDropdown from '@/app/staking_calculator/choose-dropdown';

interface OwnProps {
  value?: string | number;
  onChange: (value?: Validator) => void;
}

const ChooseValidator: FC<OwnProps> = ({ value, onChange }) => {
  const t = useTranslations('CalculatorPage');
  const [validators, setValidators] = useState<Validator[]>([]);
  useEffect(() => {
    const init = async () => {
      const vals = await getValidators();
      setValidators(vals);
    };
    init();
  }, []);

  const validatorList = useMemo(() => {
    return validators.map((v) => ({ value: v.identity, title: v.moniker }));
  }, [validators]);

  return (
    <ChooseDropdown
      name={t('Choose a Validator')}
      list={validatorList}
      selected={value}
      onChange={(value) => onChange(validators.find((v) => v.identity === value))}
    />
  );
};

export default ChooseValidator;
