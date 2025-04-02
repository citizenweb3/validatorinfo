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
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectedTitle =
    typeof selected !== 'undefined'
      ? list.find((item) => item.value.toString() === selected.toString())?.title ?? ''
      : '';

  const handleChange = (value: string | number) => {
    setIsModalOpened(false);
    onChange(value);
    setSearchQuery('');
  };

  const filteredList = list.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className={`${className} flex h-8 flex-col border-b border-bgSt pl-4 text-lg`}
    >
      <div className="flex flex-row justify-between items-center">
        <div className="text-nowrap">{name && <div>{name}:</div>}</div>
        <div
          onClick={() => setIsModalOpened(true)}
          className="h-8 min-w-6 max-w-full cursor-pointer overflow-x-hidden text-highlight"
        >
          {selectedTitle}
        </div>
        <TriangleButton direction={isModalOpened ? 't' : 'b'} onClick={() => setIsModalOpened(true)} />
      </div>
      <BaseModal maxHeight={'max-h-[25vh]'} opened={isModalOpened} onClose={() => setIsModalOpened(false)}>
        <div className={`${modalClassName} space-y-1 text-nowrap text-base items-center`}>
          <div className="sticky top-0 z-10 bg-background">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder=""
              className="w-full mx-2 py-2 my-2 pl-8 border-b border-b-primary font-sfpro text-base bg-background h-6 cursor-text bg-search bg-no-repeat bg-contain focus:outline-none focus:ring-0 peer-focus:hidden hover:bg-search_h"
            />
          </div>
          <div className="overflow-y-auto">
            {filteredList.length > 0 ? (
              filteredList.map((item) => (
                <div
                  key={item.value}
                  onClick={() => handleChange(item.value)}
                  className={`cursor-pointer px-4 py-2 
                  ${item.value.toString() === selected?.toString() ? 'text-highlight' : ''}`}
                >
                  {item.title}
                </div>
              ))
            ) : (
              <div className="px-4 py-2">No results found</div>
            )}
          </div>
        </div>
      </BaseModal>
    </div>
  );
};

export default ChooseDropdown;
