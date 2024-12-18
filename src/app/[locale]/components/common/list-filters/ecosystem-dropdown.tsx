import { FC, useRef, useState } from 'react';
import { useOnClickOutside } from 'usehooks-ts';

import Button from '@/components/common/button';
import TriangleButton from '@/components/common/triangle-button';

interface OwnProps {
  selectedEcosystems: string[];
  onChainsChanged: (value: string) => void;
}

const ecosystems = [
  { value: 'pow', title: 'POW' },
  { value: 'cosmos', title: 'Cosmos' },
  { value: 'near', title: 'Near' },
  { value: 'polkadot', title: 'Polkadot' },
  { value: 'ton', title: 'Ton' },
  { value: 'ethereum', title: 'Ethereum' },
  { value: 'solana', title: 'Solana' },
  { value: 'cardano', title: 'Cardano' },
  { value: 'iota', title: 'IOTA' },
  { value: 'icp', title: 'ICP' },
  { value: 'tezos', title: 'Tezos' },
  { value: 'gnosis', title: 'Gnosis' },
  { value: 'avalanche', title: 'Avalanche' },
];

const EcosystemDropdown: FC<OwnProps> = ({ selectedEcosystems, onChainsChanged }) => {
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const ref = useRef(null);
  useOnClickOutside(ref, () => setIsOpened(false));

  return (
    <div className="relative max-h-8 font-sfpro text-base" ref={ref}>
      <Button
        onClick={() => setIsOpened(!isOpened)}
        contentClassName={`w-40 max-w-40 flex justify-between`}
        className="h-8 max-h-8"
        isActive={selectedEcosystems.length > 0}
        activeType="switcher"
      >
        Ecosystems
        <TriangleButton direction={isOpened ? 't' : 'b'} />
      </Button>
      {isOpened && (
        <div className="absolute top-8 z-40 flex-col">
          {ecosystems.map((item) => (
            <Button
              key={item.value}
              component="button"
              onClick={() => onChainsChanged(item.value)}
              isActive={selectedEcosystems.indexOf(item.value) !== -1}
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

export default EcosystemDropdown;
