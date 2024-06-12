import { FC, useState } from 'react';

import BaseModal from '@/components/common/modal/base-modal';

interface OwnProps {
  name: string;
  list: { value: number; title: string }[];
  selected?: number;
  onChange: (value: number) => void;
}

const ChooseDropdown: FC<OwnProps> = ({ name, list, selected, onChange }) => {
  const [isModalOpened, setIsModalOpened] = useState<boolean>(false);
  const selectedTitle =
    typeof selected !== 'undefined' ? list.find((item) => item.value === selected)?.title ?? '' : '';

  const handleChange = (value: number) => {
    setIsModalOpened(false);
    onChange(value);
  };
  return (
    <div className="flex h-8 flex-row items-center justify-between border-b border-bgSt pl-4 text-lg">
      <div className="h-8">{name}:</div>
      <div onClick={() => setIsModalOpened(true)} className="ml-4 h-8 min-w-24 cursor-pointer text-highlight">
        {selectedTitle}
      </div>
      <div
        onClick={() => setIsModalOpened(true)}
        className="-mt-1 h-8 min-h-8 w-8 min-w-8 cursor-pointer bg-[url('/img/icons/plus.svg')] bg-contain hover:bg-[url('/img/icons/plus-h.svg')]"
      />
      <BaseModal opened={isModalOpened} onClose={() => setIsModalOpened(false)}>
        <div className="space-y-1 text-nowrap text-base">
          {list.map((item) => (
            <div
              onClick={() => handleChange(item.value)}
              className={`${item.value === selected ? 'text-highlight' : ''} cursor-pointer hover:text-highlight`}
            >
              {item.title}
            </div>
          ))}
        </div>
      </BaseModal>
    </div>
  );
};

export default ChooseDropdown;
