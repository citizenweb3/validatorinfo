import { FC, useRef, useState } from 'react';
import { useOnClickOutside } from 'usehooks-ts';

import Button from '@/components/common/button';
import TriangleButton from '@/components/common/triangle-button';

interface OwnProps {
  selectedNetworkStage: string[];
  onNetworkStageChanged: (value: string) => void;
  title: string;
}

const stages = [
  { value: 'mainnet', title: 'Mainnet' },
  { value: 'testnet', title: 'Testnet' },

];

const NetworkStageDropdown: FC<OwnProps> = ({ title, selectedNetworkStage, onNetworkStageChanged }) => {
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const ref = useRef(null);
  useOnClickOutside(ref, () => setIsOpened(false));

  return (
    <div className="relative max-h-8 font-sfpro text-base" ref={ref}>
      <Button
        onClick={() => setIsOpened(!isOpened)}
        contentClassName={`w-40 max-w-40 flex justify-between`}
        className="h-8 max-h-8"
        isActive={selectedNetworkStage.length > 0}
        activeType="switcher"
      >
        {title}
        <TriangleButton direction={isOpened ? 't' : 'b'} />
      </Button>
      {isOpened && (
        <div className="absolute top-8 z-40 flex-col">
          {stages.map((item) => (
            <Button
              key={item.value}
              component="button"
              onClick={() => onNetworkStageChanged(item.value)}
              isActive={selectedNetworkStage.indexOf(item.value) !== -1}
              className="text-base"
              contentClassName="max-h-7 w-40 min-w-40"
              activeType="switcher"
            >
              <div className="z-20 -my-1 flex flex-row items-center justify-center text-base font-medium">
                {item.title}
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NetworkStageDropdown;
