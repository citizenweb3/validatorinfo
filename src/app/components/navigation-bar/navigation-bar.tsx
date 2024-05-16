'use client';

import Image from 'next/image';
import { FC, useState } from 'react';

import icons from '@/app/components/icons';
import NavigationBarItem from '@/components/navigation-bar/navigation-bar-item';

interface OwnProps {}

const data = [
  { name: 'Validators', href: 'validators', icon: icons.ValidatorsIcon },
  { name: 'Networks', href: 'networks', icon: icons.NetworksIcon },
  { name: 'Metrics', href: 'metrics', icon: icons.MetricsIcon },
  { name: 'Staking Calculator', href: 'calculator', icon: icons.CalculatorIcon },
  { name: 'Validator Comparison', href: 'comparison', icon: icons.ComparisonIcon },
  { name: 'Rumors', href: 'rumors', icon: icons.NetworksIcon },
  { name: 'Library', href: 'library', icon: icons.LibraryIcon },
  { name: 'About Us', href: 'about', icon: icons.AboutIcon },
];

const NavigationBar: FC<OwnProps> = ({}) => {
  const [isOpened, setIsOpened] = useState<boolean>(true);
  return (
    <div
      className={`${isOpened ? 'w-56' : 'w-16'} transition-300 border-transparent relative mt-2 h-[75vh] border-r-[1.5rem] pt-6 transition-all`}
    >
      <Image
        src={icons.HideIcon}
        alt="hide"
        className={`${!isOpened && 'rotate-180'} absolute -right-6 top-0 w-6`}
        onClick={() => setIsOpened(!isOpened)}
      />
      <div className="relative space-y-2.5 overflow-hidden">
        {data.map((item) => (
          <NavigationBarItem key={item.name} item={item} />
        ))}
      </div>
    </div>
  );
};

export default NavigationBar;
