import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import icons from '@/components/icons';

interface OwnProps {
  id: number;
  battery?: number;
}

const ValidatorListItemBattery: FC<OwnProps> = ({ id, battery }) => {
  return (
    <Link href={`/validators/${id}`} className="group/battery flex h-full items-center justify-center">
      <div className="relative max-h-12 w-32">
        <div
          className={`absolute mt-4 w-full text-center text-highlight group-hover/battery:text-white group-active/battery:mt-5`}
        >
          {battery ? `${battery}%` : '?'}
        </div>
        <Image src={icons.BatteryIcon} alt="battery" className="mt-1 w-32 group-active/battery:hidden" />
        <Image src={icons.BatteryIconActive} alt="battery" className="mt-2 hidden w-32 group-active/battery:block" />
      </div>
    </Link>
  );
};

export default ValidatorListItemBattery;
