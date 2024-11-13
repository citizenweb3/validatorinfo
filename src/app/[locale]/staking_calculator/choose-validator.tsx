'use client';

import { useTranslations } from 'next-intl';
import { FC } from 'react';

import ChooseDropdown, { DropdownListItem } from '@/app/staking_calculator/choose-dropdown';

interface OwnProps {
  value?: string | number;
  onChange: (value?: string) => void;
  list: DropdownListItem[];
}

const ChooseValidator: FC<OwnProps> = ({ value, onChange, list }) => {
  const t = useTranslations('CalculatorPage');

  return (
    <ChooseDropdown
      name={t('Choose a Validator')}
      list={list}
      selected={value}
      onChange={(value) => onChange(value.toString())}
      className="flex-grow"
    />
  );
};

export default ChooseValidator;
