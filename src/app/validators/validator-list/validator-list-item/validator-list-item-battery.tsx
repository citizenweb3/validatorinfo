import Image from 'next/image';
import { FC } from 'react';

import icons from '@/components/icons';

interface OwnProps {
  battery?: number;
}

const ValidatorListItemBattery: FC<OwnProps> = ({ battery }) => {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="relative w-32">
        <div
          className={`absolute -ml-1.5 mt-[1.4rem] w-full text-center ${!battery ? 'text-bgSt' : battery < 30 ? 'text-red' : battery < 70 ? 'text-highlight' : 'text-secondary'}`}
        >
          {battery ? `${battery}%` : '?'}
        </div>
        <Image src={icons.BatteryIcon} alt="battery" className="mt-3 w-32" />
      </div>
    </div>
  );
};

export default ValidatorListItemBattery;
