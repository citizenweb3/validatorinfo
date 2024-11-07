import { useTranslations } from 'next-intl';
import { FC } from 'react';

import ChooseDropdown from '@/app/staking_calculator/choose-dropdown';

interface OwnProps {
  onAdd: (name: string) => void;
  exists: string[];
}

const ValidatorEmptyItem: FC<OwnProps> = ({ exists, onAdd }) => {
  const t = useTranslations('ComparisonPage');
  const validatorList = [
    { value: 'POSTHUMAN', title: 'POSTHUMAN' },
    { value: 'Bro_n_Bro', title: 'Bro_n_Bro' },
    { value: 'Imperator', title: 'Imperator' },
    { value: '01node', title: '01node' },
    { value: 'Stakeflow', title: 'Stakeflow' },
    { value: 'PUPMØS', title: 'PUPMØS' },
    { value: 'Citadel.one', title: 'Citadel.one' },
  ];
  return (
    <div className="max-w-60">
      <ChooseDropdown
        className="!h-20"
        name={t('Add')}
        list={validatorList.filter((v) => !exists.includes(v.value))}
        onChange={(value) => onAdd(value as string)}
      />
    </div>
  );
};

export default ValidatorEmptyItem;
