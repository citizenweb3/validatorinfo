'use client';

import { FC } from 'react';
import NavigationBarItem from '@/components/navigation-bar/navigation-bar-item';
import { aboutTabs, additionalTabs, mainTabs } from '@/components/navigation-bar/navigation-bar';
import Image from 'next/image';
import icons from '@/components/icons';
import { useTranslations } from 'next-intl';

interface OwnProps {
  isOpened: boolean;
  onClose: () => void;
}

const MobileNavigationBar: FC<OwnProps> = ({ isOpened, onClose }) => {
  const t = useTranslations("Navbar")

  return (
    <div
      className={`fixed left-0 top-72 sm:top-40 z-50 w-full sm:h-full overflow-y-auto bg-background pt-6 transition-transform duration-300 md:hidden 
      ${isOpened ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="space-y-3 px-4">
        {mainTabs.map((item) => (
          <div key={item.name} onClick={onClose}>
            <NavigationBarItem item={item} isOpened />
          </div>
        ))}
        {additionalTabs.map((item) => (
          <div key={item.name} onClick={onClose}>
            <NavigationBarItem item={item} isOpened />
          </div>
        ))}
        {aboutTabs.map((item) => (
          <div key={item.name} onClick={onClose}>
            <NavigationBarItem item={item} isOpened />
          </div>
        ))}
      </div>
      <div className="mt-32 py-16 shadow-button">
        <div className="font-sfpro text-8xl sm:text-5xl mx-24">{t('mobile description')}</div>
        <div className="flex justify-end mr-52">
          <Image src={icons.Cosmonaut} alt={'Error'} className="min-w-64 max-w-64 sm:min-w-40 sm:max-w-40" />
        </div>
        <div className="-mt-16 h-32 bg-bgSt" />
      </div>
    </div>
  );
};


export default MobileNavigationBar;
