'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { FC, useEffect } from 'react';

import Footer from '@/components/footer';
import icons from '@/components/icons';
import NavigationBarItem from '@/components/navigation-bar/navigation-bar-item';
import { homeTabs, networkTabs, toolsTabs } from '@/components/navigation-bar/navigation-bar';

interface OwnProps {
  isOpened: boolean;
  onClose: () => void;
}

const MobileNavigationBar: FC<OwnProps> = ({ isOpened, onClose }) => {
  const t = useTranslations('Navbar');
  const mobileTabs = [...homeTabs, ...networkTabs, ...toolsTabs];

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', isOpened);

    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpened]);

  return (
    <div
      className={`
        fixed inset-0 top-72 z-50 flex flex-col bg-background pt-6 transition-transform duration-300 sm:top-52 md:hidden
        ${isOpened ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <div className="mx-6 flex-grow overflow-y-auto">
        <div className="space-y-3 px-4">
          {mobileTabs.map((item) => (
            <div key={item.name} onClick={onClose}>
              <NavigationBarItem item={item} isOpened />
            </div>
          ))}
        </div>

        <div className="mx-6 mt-32 py-16 shadow-button">
          <div className="mx-24 font-sfpro text-7xl sm:text-5xl">
            {t('mobile description')}
          </div>
          <div className="mr-52 flex justify-end">
            <Image src={icons.Cosmonaut} alt="Error" className="min-w-64 max-w-64 sm:min-w-40 sm:max-w-40" />
          </div>
          <div className="-mt-16 h-32 bg-bgSt sm:h-24" />
        </div>
      </div>
      <div className="mb-7">
        <Footer />
      </div>
    </div>
  );
};

export default MobileNavigationBar;
