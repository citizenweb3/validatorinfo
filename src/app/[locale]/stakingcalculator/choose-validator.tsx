'use client';

import { useTranslations } from 'next-intl';
import { FC } from 'react';

import ChooseDropdown, { DropdownListItem } from '@/app/stakingcalculator/choose-dropdown';

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
      modalClassName="min-w-40 max-w-96"
      className="flex-grow"
    />
  );
};

export default ChooseValidator;
