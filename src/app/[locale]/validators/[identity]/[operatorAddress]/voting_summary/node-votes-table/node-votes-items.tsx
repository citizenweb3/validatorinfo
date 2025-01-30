import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import icons from '@/components/icons';

interface OwnProps {
  item: {
    proposalId: number;
    proposalTitle: string;
    proposalType: string;
    vote: string;
    votingEnded: string;
  };
}

const NodeVotesItem: FC<OwnProps> = ({ item }) => {
  const getSquareIcon = () => {
    switch (item.vote) {
      case 'Yes':
        return icons.GreenSquareIcon;
      case 'No':
        return icons.RedSquareIcon;
      case 'Abstain':
        return icons.YellowSquareIcon;
      default:
        return icons.GreenSquareIcon;
    }
  };

  return (
    <tr className="group cursor-pointer hover:bg-bgHover">
      <td className="w-2/6 border-b border-black py-4 hover:text-highlight active:border-bgSt">
        <Link href={''} className="flex items-center gap-1">
          <Image src={getSquareIcon()} alt={`${item.vote}`} width={30} height={30} />
          <div className="font-handjet text-xl text-highlight">{`#${item.proposalId}`}</div>
          <div className="text-sm">{item.proposalTitle}</div>
        </Link>
      </td>
      <td className="w-1/6 border-b border-black px-2 py-2 text-sm hover:text-highlight active:border-bgSt">
        <Link href={''} className="flex justify-center">
          <div className="text-center">{item.proposalType}</div>
        </Link>
      </td>
      <td className="w-1/6 border-b border-black px-2 py-2 text-sm hover:text-highlight active:border-bgSt">
        <Link href={''} className="flex justify-center">
          <div className="text-center">{item.vote}</div>
        </Link>
      </td>
      <td className="w-2/6 border-b border-black px-2 py-2 text-base hover:text-highlight active:border-bgSt">
        <Link href={''} className="flex justify-center">
          <div className="font-handjet text-center">{item.votingEnded}</div>
        </Link>
      </td>
    </tr>
  );
};

export default NodeVotesItem;
