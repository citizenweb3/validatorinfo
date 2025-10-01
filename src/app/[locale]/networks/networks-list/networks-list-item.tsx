import Link from 'next/link';
import { FC } from 'react';

import TableAvatar from '@/components/common/table/table-avatar';
import Tooltip from '@/components/common/tooltip';
import { ChainWithParamsAndTokenomics } from '@/services/chain-service';
import formatCash from '@/utils/format-cash';

interface OwnProps {
  item: ChainWithParamsAndTokenomics;
}

const NetworksListItem: FC<OwnProps> = async ({ item }) => {
  const size = 'h-12 w-12 min-w-12 min-h-12 mx-auto';

  return (
    <tr className="group font-handjet hover:bg-bgHover ">
      <td className="group/avatar w-1/3 border-b border-black px-2 py-2 font-sfpro hover:text-highlight active:border-bgSt">
        <TableAvatar icon={item.logoUrl} name={item.prettyName} href={`/networks/${item.name}/overview`} />
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base active:border-bgSt">
        <div className="text-center">{item.params?.denom}</div>
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base active:border-bgSt">
        <Tooltip tooltip={`$${item?.tokenomics?.fdv.toLocaleString()}`}>
          <div className="text-center">${formatCash(item?.tokenomics?.fdv ?? 0)}</div>
        </Tooltip>
      </td>
      <td className="border-b border-black px-2 py-2 active:border-bgSt">
        <div className="flex justify-center">
          {item.docs && item?.docs.startsWith('http') ? (
            <Link href={item.docs} className={`${size}`} target="_blank">
              <div className={`${size} bg-web bg-contain bg-no-repeat hover:bg-web_h`} />
            </Link>
          ) : (
            <div className={`${size}`}>
              <div className={`${size} bg-web bg-contain bg-no-repeat opacity-40`} />
            </div>
          )}
          {item.githubUrl && item.githubUrl.startsWith('http') ? (
            <Link href={item.githubUrl} className={size} target="_blank">
              <div className={`${size} bg-github bg-contain bg-no-repeat hover:bg-github_h`} />
            </Link>
          ) : (
            <div className={`${size}`}>
              <div className={`${size} bg-github bg-contain bg-no-repeat opacity-40`} />
            </div>
          )}
          {item.twitterUrl && item.twitterUrl.startsWith('http') ? (
            <Link href={item.twitterUrl} className={size} target="_blank">
              <div className={`${size} bg-x bg-contain bg-no-repeat hover:bg-x_h`} />
            </Link>
          ) : (
            <div className={`${size}`}>
              <div className={`${size} bg-x bg-contain bg-no-repeat opacity-40`} />
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

export default NetworksListItem;
