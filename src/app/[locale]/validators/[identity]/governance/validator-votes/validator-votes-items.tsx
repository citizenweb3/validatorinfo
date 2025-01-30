import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import icons from '@/components/icons';

interface OwnProps {
  item: {
    networkName: string;
    proposalId: number;
    proposalTitle: string;
    vote: string;
  };
}

const ValidatorVotesItem: FC<OwnProps> = ({ item }) => {
  const getSquareIcon = () => {
    switch (item.vote) {
      case 'Yes':
        return icons.GreenSquareIcon;
      case 'No':
        return icons.RedSquareIcon;
      default:
        return icons.GreenSquareIcon;
    }
  };

  return (
    <tr className="group cursor-pointer font-handjet font-light hover:bg-bgHover">
      <td className="w-1/3 border-b border-black py-4 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={''} className="flex items-center gap-1">
          <Image src={getSquareIcon()} alt={`${item.vote}`} width={20} height={20} />
          <div className="text-center">{item.networkName}</div>
        </Link>
      </td>
      <td className="w-1/3 border-b border-black py-4 font-sfpro text-base active:border-bgSt">
        <Link href={''} className="flex justify-center gap-2">
          <div className="font-handjet text-xl font-light text-highlight">{`#${item.proposalId}`}</div>
          <div className="self-end text-center">{item.proposalTitle}</div>
        </Link>
      </td>
      <td className="w-1/3 border-b border-black px-2 py-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={''} className="flex justify-center">
          <div className="text-center">{item.vote}</div>
        </Link>
      </td>
    </tr>
  );
};

export default ValidatorVotesItem;
