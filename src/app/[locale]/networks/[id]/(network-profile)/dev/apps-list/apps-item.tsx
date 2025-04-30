import Link from 'next/link';
import { FC } from 'react';
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
    <tr className="cursor-pointer hover:bg-bgHover">
      <td className="group/avatar border-b border-black py-2 font-sfpro hover:text-highlight active:border-bgSt">
        <TableAvatar icon={icons.AvatarIcon} name={item.name} href={``} />
      </td>
      <td className="border-b border-black py-4 flex flex-row justify-center -space-x-2">
        <Link href={''} className={size} target="_blank">
          <div className={`${size} bg-github bg-contain bg-no-repeat hover:bg-github_h`} />
        </Link>
        <Link href={''} className={`${size}`}>
          <div className={`${size} bg-web bg-contain bg-no-repeat hover:bg-web_h`} />
        </Link>
        <Link href={''} className={size} target="_blank">
          <div className={`${size} bg-x bg-contain bg-no-repeat hover:bg-x_h`} />
        </Link>
      </td>
      <td className="border-b border-black py-4 hover:text-highlight active:border-bgSt">
        <Link href={''} className="flex justify-center">
          <div className="text-center font-handjet text-lg">{item.users}</div>
        </Link>
      </td>
      <td className="border-b border-black py-4 text-base hover:text-highlight active:border-bgSt">
        <Link href={''} className="flex justify-center">
          <div className="text-center font-handjet text-lg">{item.wau}</div>
        </Link>
      </td>
      <td className="border-b border-black py-4 text-base hover:text-highlight active:border-bgSt">
        <Link href={''} className="flex justify-center">
          <div className="text-center font-handjet text-lg">{item.capital}</div>
        </Link>
      </td>
    </tr>
  );
};

export default NetworkAppsItem;
