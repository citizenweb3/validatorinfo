import Link from 'next/link';
import { FC } from 'react';

import BaseTableCell from '@/components/common/table/base-table-cell';
import BaseTableRow from '@/components/common/table/base-table-row';
import TableAvatar from '@/components/common/table/table-avatar';
import icons from '@/components/icons';

interface OwnProps {
  item: {
    name: string;
    links: string;
    users: string;
    wau: string;
    capital: string;
  };
}

const NetworkAppsItem: FC<OwnProps> = ({ item }) => {
  const size = 'h-11 w-11 min-w-11 min-h-11';

  return (
    <BaseTableRow>
      <BaseTableCell className="py-2 font-sfpro hover:text-highlight">
        <TableAvatar icon={icons.AvatarIcon} name={item.name} href={``} />
      </BaseTableCell>
      <BaseTableCell className="py-4 flex flex-row justify-center -space-x-2">
        <Link href={''} className={size} target="_blank">
          <div className={`${size} bg-github bg-contain bg-no-repeat hover:bg-github_h`} />
        </Link>
        <Link href={''} className={`${size}`}>
          <div className={`${size} bg-web bg-contain bg-no-repeat hover:bg-web_h`} />
        </Link>
        <Link href={''} className={size} target="_blank">
          <div className={`${size} bg-x bg-contain bg-no-repeat hover:bg-x_h`} />
        </Link>
      </BaseTableCell>
      <BaseTableCell className="py-4 hover:text-highlight">
        <Link href={''} className="flex justify-center">
          <div className="text-center font-handjet text-lg">{item.users}</div>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="py-4 text-base hover:text-highlight">
        <Link href={''} className="flex justify-center">
          <div className="text-center font-handjet text-lg">{item.wau}</div>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="py-4 text-base hover:text-highlight">
        <Link href={''} className="flex justify-center">
          <div className="text-center font-handjet text-lg">{item.capital}</div>
        </Link>
      </BaseTableCell>
    </BaseTableRow>
  );
};

export default NetworkAppsItem;
