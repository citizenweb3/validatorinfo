'use client';

import Link from 'next/link';
import { FC } from 'react';

import ValidatorListItemAvatar from '@/app/main-validators/validator-list/validator-list-item/validator-list-item-avatar';
import { Chain, ValidatorItem } from '@/types';

interface OwnProps {
  validator: ValidatorItem;
  chains: Chain[];
}

const SimpleValidatorListItem: FC<OwnProps> = ({ validator }) => {
  const size = 'h-12 w-12 min-w-12 min-h-12 mx-auto';

  return (
    <tr className="group font-handjet hover:bg-bgHover ">
      <td className="group/avatar w-1/3 border-b border-black px-2 py-2 font-sfpro hover:text-highlight active:border-bgSt">
        <ValidatorListItemAvatar icon={validator.logoUrl} name={validator.moniker} id={validator.operatorAddress} />
      </td>
      <td className="border-b border-black px-2 py-2 active:border-bgSt">
        <Link href={validator.links?.website ?? ''} className={`${size}`}>
          <div className={`${size} bg-web hover:bg-web_h bg-contain bg-no-repeat`} />
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 active:border-bgSt">
        <Link href={validator.links?.github ?? ''} className={size} target="_blank">
          <div className={`${size} bg-github bg-contain bg-no-repeat hover:bg-github_h`} />
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 active:border-bgSt">
        <Link href={validator.links?.x ?? ''} className={size} target="_blank">
          <div className={`${size} bg-x bg-contain bg-no-repeat hover:bg-x_h`} />
        </Link>
      </td>
    </tr>
  );
};

export default SimpleValidatorListItem;
