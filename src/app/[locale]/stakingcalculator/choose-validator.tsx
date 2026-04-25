'use client';

import { useTranslations } from 'next-intl';
import { FC } from 'react';

import ChooseDropdown, { DropdownListItem } from '@/app/stakingcalculator/choose-dropdown';

interface OwnProps {
  value?: string | number;
  onChange: (value?: string) => void;
  onClear?: () => void;
  list: DropdownListItem[];
}

const ChooseValidator: FC<OwnProps> = ({ value, onChange, onClear, list }) => {
  const t = useTranslations('CalculatorPage');

  return (
    <ChooseDropdown
      name={t('Choose a Validator')}
      list={list}
      selected={value}
      onChange={(value) => onChange(value as string)}
      onClear={onClear}
      variant="card"
      modalClassName="min-w-80 max-w-96"
    />
  );
};

export default ChooseValidator;
