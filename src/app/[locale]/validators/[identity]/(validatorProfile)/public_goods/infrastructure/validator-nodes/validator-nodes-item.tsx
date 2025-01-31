import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import icons from '@/components/icons';

interface OwnProps {
  item: { color: string; networks: string; url: string };
}

const ValidatorNodesItem: FC<OwnProps> = ({ item }) => {
  const getSquareIcon = () => {
    switch (item.color) {
      case 'green':
        return icons.GreenSquareIcon;
      case 'red':
        return icons.RedSquareIcon;
      case 'yellow':
        return icons.YellowSquareIcon;
      default:
        return icons.GreenSquareIcon;
    }
  };

  return (
    <tr className="group cursor-pointer font-handjet hover:bg-bgHover">
      <td className="w-1/3 border-b border-black py-4 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={''} className="flex items-center gap-1">
          <Image src={getSquareIcon()} alt={`${item.color}`} width={20} height={20} />
          <div className="text-center">{item.networks}</div>
        </Link>
      </td>
      <td className="w-2/3 border-b border-black px-2 py-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={''} className="flex items-center justify-center gap-1">
          <div className="flex items-center justify-center">{item.url}</div>
        </Link>
      </td>
    </tr>
  );
};

export default ValidatorNodesItem;
