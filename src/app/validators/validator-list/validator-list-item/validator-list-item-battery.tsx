import Image from 'next/image';
import { FC, useEffect, useState } from 'react';

import icons from '@/components/icons';

interface OwnProps {
  battery?: number;
}

const ValidatorListItemBattery: FC<OwnProps> = ({ battery }) => {
  const [p, setP] = useState(battery ? battery / 6.25 : Math.floor(Math.random() * 16));
  useEffect(() => {
    if (!battery) {
      const int = setInterval(() => setP((s) => (s < 16 ? s + 1 : 1)), 100);
      return () => {
        clearInterval(int);
      };
    }
  }, [battery]);
  const percent = p * 6.1;
  return (
    <div className="flex items-center justify-center">
      <div className="relative h-4 w-32">
        <div className="absolute left-0.5 top-[0.12rem] h-[0.9rem] w-[7.70rem] bg-bgSt" />
        {percent < 30 ? (
          <div
            style={{ width: `${percent}%` }}
            className={`absolute left-0.5 top-[0.12rem] h-[0.9rem] bg-[url('/img/icons/batteryred.png')]`}
          />
        ) : percent < 70 ? (
          <div
            style={{ width: `${percent}%` }}
            className={`absolute left-0.5 top-[0.12rem] h-[0.9rem] bg-[url('/img/icons/batteryyellow.png')]`}
          />
        ) : (
          <div
            style={{ width: `${percent}%` }}
            className={`absolute left-0.5 top-[0.12rem] h-[0.9rem] bg-[url('/img/icons/batterygreen.png')]`}
          />
        )}
        <Image src={icons.BatteryIcon} alt="Battery" className="absolute left-0 top-0 w-32" />
      </div>
    </div>
  );
};

export default ValidatorListItemBattery;
