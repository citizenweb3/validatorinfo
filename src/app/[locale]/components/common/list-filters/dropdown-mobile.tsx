import { FC, useRef, useState } from 'react';
import { useOnClickOutside } from 'usehooks-ts';

import Button from '@/components/common/button';
import TriangleButton from '@/components/common/triangle-button';

interface OwnProps {
  selectedValue: string[];
  onChanged: (value: string) => void;
  title: string;
  filterValues: {
    value: string;
    title: string;
  }[];
}

const DropdownMobile: FC<OwnProps> = ({filterValues, title, selectedValue, onChanged }) => {
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const ref = useRef(null);
  useOnClickOutside(ref, () => setIsOpened(false));

  return (
    <div className="relative max-h-44 font-sfpro text-6xl mt-14 mb-6" ref={ref}>
      <Button
        onClick={() => setIsOpened(!isOpened)}
        contentClassName={`flex justify-between mx-4`}
        className="h-24 max-h-24"
        isActive={selectedValue.length > 0}
        activeType="switcher"
      >
        {title}
        <TriangleButton direction={isOpened ? 't' : 'b'} />
      </Button>
      {isOpened && (
        <div className="absolute flex top-8 z-[60] flex-col">
          {filterValues.map((item) => (
            <Button
              key={item.value}
              component="button"
              onClick={() => onChanged(item.value)}
              isActive={selectedValue.indexOf(item.value) !== -1}
              className="text-6xl"
              contentClassName="max-h-20 w-96 min-w-96 my-3"
              activeType="switcher"
            >
              <div className="z-20 -my-1 flex flex-row items-center justify-center text-6xl font-medium">
                {item.title}
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownMobile;
