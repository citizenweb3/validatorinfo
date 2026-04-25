import { FC, MouseEvent, useState } from 'react';

import BaseModal from '@/components/common/modal/base-modal';
import TriangleButton from '@/components/common/triangle-button';
import { cn } from '@/utils/cn';

export type DropdownListItem = { value: string | number; title: string };

interface OwnProps {
  name?: string;
  list: DropdownListItem[];
  selected?: string | number;
  onChange: (value: string | number) => void;
  onClear?: () => void;
  className?: string;
  modalClassName?: string;
  variant?: 'inline' | 'card';
}

const ChooseDropdown: FC<OwnProps> = ({
  name,
  list,
  selected,
  onChange,
  onClear,
  className = '',
  modalClassName = '',
  variant = 'inline',
}) => {
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

  const handleClear = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onClear?.();
  };

  const filteredList = list.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const dropdownModal = (
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
                className={cn(
                  'cursor-pointer px-4 py-2',
                  item.value.toString() === selected?.toString() && 'text-highlight',
                )}
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
  );

  if (variant === 'card') {
    return (
      <div
        className={cn(
          'relative flex min-h-[170px] flex-col border-r border-t border-bgSt bg-table_row p-4 shadow-menu-button-rest',
          className,
        )}
      >
        <div className="flex items-start justify-between">
          <div className="min-h-[1.5rem]">
            {selectedTitle && (
              <>
                <div className="whitespace-pre-line text-base">{selectedTitle}</div>
                <div className="mt-1 h-0.5 w-6 bg-highlight" />
              </>
            )}
          </div>
          {onClear && selectedTitle && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear selection"
              className="text-lg leading-none text-text/60 hover:text-highlight"
            >
              ✕
            </button>
          )}
        </div>
        <div
          className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-1"
          onClick={() => setIsModalOpened(true)}
        >
          {name && <div className="font-bold">{name}</div>}
          <TriangleButton direction={isModalOpened ? 't' : 'b'} />
        </div>
        {dropdownModal}
      </div>
    );
  }

  return (
    <div className={`${className} flex h-8 flex-col border-b border-bgSt pl-4 text-lg`}>
      <div
        className="flex flex-row justify-between items-center cursor-pointer"
        onClick={() => setIsModalOpened(true)}
      >
        <div className="text-nowrap">{name && <div>{name}:</div>}</div>
        <div className="h-8 min-w-6 max-w-full overflow-x-hidden text-highlight">
          {selectedTitle}
        </div>
        <TriangleButton direction={isModalOpened ? 't' : 'b'} />
      </div>
      {dropdownModal}
    </div>
  );
};

export default ChooseDropdown;
