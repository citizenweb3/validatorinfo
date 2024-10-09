'use client';

import Link from 'next/link';
import { FC } from 'react';

import TableAvatar from '@/components/common/table/table-avatar';
import { Chain } from '@/types';

interface OwnProps {
  item: Chain;
}

const NetworksListItem: FC<OwnProps> = ({ item }) => {
  const size = 'h-12 w-12 min-w-12 min-h-12 mx-auto';

  return (
    <tr className="group font-handjet hover:bg-bgHover ">
      <td className="group/avatar w-1/3 border-b border-black px-2 py-2 font-sfpro hover:text-highlight active:border-bgSt">
        <TableAvatar icon={item.logoUrl} name={item.prettyName} href={`/networks/${item.name}`} />
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base active:border-bgSt">
        <div className="text-center">{item.denom}</div>
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base active:border-bgSt">
        <div className="text-center">-</div>
      </td>
      <td className="border-b border-black px-2 py-2 active:border-bgSt">
        <Link href={item.github?.url ?? ''} className={`${size}`}>
          <div className={`${size} bg-web hover:bg-web_h bg-contain bg-no-repeat`} />
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 active:border-bgSt">
        <Link href={item.github?.url ?? ''} className={size} target="_blank">
          <div className={`${size} bg-github bg-contain bg-no-repeat hover:bg-github_h`} />
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 active:border-bgSt">
        <Link href={item.twitterUrl ?? ''} className={size} target="_blank">
          <div className={`${size} bg-x bg-contain bg-no-repeat hover:bg-x_h`} />
        </Link>
      </td>
    </tr>
  );
};

export default NetworksListItem;
