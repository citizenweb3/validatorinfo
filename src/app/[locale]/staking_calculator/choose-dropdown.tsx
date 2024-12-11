import { FC, useState } from 'react';

import BaseModal from '@/components/common/modal/base-modal';
import TriangleButton from '@/components/common/triangle-button';

export type DropdownListItem = { value: string | number; title: string };

interface OwnProps {
  name?: string;
  list: DropdownListItem[];
  selected?: string | number;
  onChange: (value: string | number) => void;
  className?: string;
  modalClassName?: string;
}

const ChooseDropdown: FC<OwnProps> = ({ name, list, selected, onChange, className = '', modalClassName = '' }) => {
  const [isModalOpened, setIsModalOpened] = useState<boolean>(false);
  const selectedTitle =
    typeof selected !== 'undefined' ? list.find((item) => item.value === selected)?.title ?? '' : '';

  const handleChange = (value: string | number) => {
    setIsModalOpened(false);
    onChange(value);
  };
  return (
    <div
      className={`${className} flex h-8 flex-grow flex-row items-center justify-between border-b border-bgSt pl-4 text-lg`}
    >
      <div className="text-nowrap">{name && <div>{name}:</div>}</div>
      <div
        onClick={() => setIsModalOpened(true)}
        className="ml-4 h-8 min-w-6 max-w-full cursor-pointer overflow-x-hidden text-highlight"
      >
        {selectedTitle}
      </div>
      <TriangleButton direction={isModalOpened ? 't' : 'b'} onClick={() => setIsModalOpened(true)} />
      <BaseModal opened={isModalOpened} onClose={() => setIsModalOpened(false)} className="right-0 top-0">
        <div className={`${modalClassName} space-y-1 text-nowrap text-base`}>
          {list.map((item) => (
            <div
              key={item.value}
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
