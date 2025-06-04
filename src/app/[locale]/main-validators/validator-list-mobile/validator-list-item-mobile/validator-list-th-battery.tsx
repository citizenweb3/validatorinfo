import Image from 'next/image';
import { FC } from 'react';
import icons from '@/components/icons';

interface OwnProps {
  className?: string;
}

const ValidatorListThBattery: FC<OwnProps> = ({ className }) => (
  <th className={`${className} relative w-48`}>
    <Image
      src={icons.BatteryIcon}
      alt="battery"
      fill
      className="object-contain"
    />
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-handjet text-5xl">
      100%
    </div>
  </th>
);

export default ValidatorListThBattery;
