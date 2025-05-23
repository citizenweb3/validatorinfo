import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import icons from '@/components/icons';
import { ValidatorVote } from '@/services/vote-service';

interface OwnProps {
  item: ValidatorVote;
}

const ValidatorVotesItem: FC<OwnProps> = ({ item }) => {
  const getSquareIcon = () => {
    switch (item.vote) {
      case 'YES':
        return icons.GreenSquareIcon;
      case 'NO':
        return icons.RedSquareIcon;
      default:
        return icons.GreenSquareIcon;
    }
  };

  const proposalLink = `/networks/${item.chain.id}/proposal/${item.proposalId}`;
  const chainLink = `/networks/${item.chain.id}/overview`;

  return (
    <tr className="group cursor-pointer font-handjet hover:bg-bgHover">
      <td className="w-1/4 border-b border-black py-4 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={chainLink} className="flex items-center gap-1">
          <Image src={getSquareIcon()} alt={`${item.vote}`} width={20} height={20} />
          <div className="text-center">{item.chain.prettyName}</div>
        </Link>
      </td>
      <td className="w-2/4 border-b border-black py-4 text-base active:border-bgSt">
        <Link href={proposalLink} className="flex gap-2">
          <div className="font-handjet text-xl text-highlight">{`#${item.proposalId}`}</div>
          <div className="">{item.title}</div>
        </Link>
      </td>
      <td className="w-1/4 border-b border-black px-2 py-2 text-base hover:text-highlight active:border-bgSt">
        <Link href={proposalLink} className="flex justify-center">
          <div className="text-center">{item.vote}</div>
        </Link>
      </td>
    </tr>
  );
};

export default ValidatorVotesItem;
