import { FC } from 'react';

import ChooseDropdown from '@/app/staking_calculator/choose-dropdown';

interface OwnProps {
  name?: string;
  onAdd: (name: string) => void;
  list: { value: string; title: string }[];
  exists: string[];
}

const ValidatorEmptyItem: FC<OwnProps> = ({ name = '', exists, onAdd, list }) => {
  return (
    <ChooseDropdown
      className="-ml-3 !h-20 !pl-0"
      name={name}
      list={list.filter((v) => !exists.includes(v.value))}
      onChange={(value) => onAdd(value as string)}
    />
  );
};

export default ValidatorEmptyItem;
