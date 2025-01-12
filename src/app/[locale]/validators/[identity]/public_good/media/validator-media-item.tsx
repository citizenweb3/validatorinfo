import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import Tooltip from '@/components/common/tooltip';

interface OwnProps {
  item: {
    name: string;
    approved: number;
  };
}

const ValidatorMediaItem: FC<OwnProps> = ({ item }) => {
  const t = useTranslations('PublicGoodMediaPage');

  return (
    <tr className="group cursor-pointer font-handjet hover:bg-bgHover">
      <td className="w-1/3 border-b border-black py-4 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={''} className="">
          <div className="ml-2.5">{item.name}</div>
        </Link>
      </td>
      <td className="w-1/3 border-b border-black py-3 font-sfpro text-base">
        <div className="flex h-full items-stretch justify-center gap-4">
          <Tooltip className="text-nowrap" tooltip={t('tooltip')} direction={'top'}>
            <div className="bg-approved hover:bg-approved_h active:bg-approved_a h-12 w-12 self-end bg-contain bg-no-repeat" />
          </Tooltip>
          <Tooltip className="text-nowrap" tooltip={t('tooltip')} direction={'top'}>
            <div className="bg-disapproved hover:bg-disapproved_h active:bg-disapproved_a h-12 w-12 self-start bg-contain bg-no-repeat" />
          </Tooltip>
        </div>
      </td>
      <td className="w-1/3 border-b border-black px-2 py-2 font-sfpro text-base">
        <div className="flex justify-end">
          <div>
            Approved by: <span className="font-handjet text-lg text-highlight">{item.approved}%</span>
          </div>
        </div>
      </td>
    </tr>
  );
};

export default ValidatorMediaItem;
