import { FC, useState } from 'react';

import BaseModal from '@/components/common/modal/base-modal';
import TriangleButton from '@/components/common/triangle-button';
import Image from 'next/image';
import icons from '@/components/icons';
import { useTranslations } from 'next-intl';

export type DropdownAsset = { assetName: string; network: string };

interface OwnProps {
  list: DropdownAsset[];
}

const AssetsDropdown: FC<OwnProps> = ({ list }) => {
  const t = useTranslations('ProfilePage.Wallet');
  const [isModalOpened, setIsModalOpened] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  return (
    <div className="flex w-[400px] flex-col border-b border-bgSt text-base mx-auto my-6">
      <div className="flex flex-row justify-between items-center py-4 hover:bg-bgHover">
        <div className="text-nowrap font-handjet text-xl ml-4">0</div>
        <div onClick={() => setIsModalOpened(true)}
          className="cursor-pointer ml-auto text-sm"
        >
          {t('select asset')}
        </div>
        <div className="mx-2 self-center">
          <TriangleButton direction={isModalOpened ? 't' : 'b'} onClick={() => setIsModalOpened(true)} />
        </div>
      </div>
      <BaseModal style={{ width: '500px' }}
                 hideClose
                 maxHeight={'max-h-[50vh]'}
                 opened={isModalOpened}
                 onClose={() => setIsModalOpened(false)}
                 className="-ml-10 -mt-20"
      >
        <div className="space-y-1 text-nowrap text-base items-center">
          <div className="sticky top-0 z-10 bg-background">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search asset')}
              className="w-full mx-2 py-2 my-2 pl-12 border-b border-b-primary font-sfpro text-base bg-background h-8 cursor-text bg-search bg-no-repeat bg-contain focus:outline-none focus:ring-0 peer-focus:hidden hover:bg-search_h"
            />
          </div>
          <div className="overflow-y-auto">
            {list.map((item) => (
                <div key={item.assetName} className="flex flex-row cursor-pointer px-4 pb-1 pt-3 hover:text-highlight hover:bg-bgHover border-b border-b-primary">
                  <Image src={icons.AvatarIcon} alt={'Avatar'} width={50} height={50} />
                  <div className="flex flex-col ml-4 justify-center">
                    <div className="text-lg">{item.assetName}</div>
                    <div className="text-base">{item.network}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </BaseModal>
    </div>
  );
};

export default AssetsDropdown;
