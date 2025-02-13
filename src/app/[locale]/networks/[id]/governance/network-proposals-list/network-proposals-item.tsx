import Link from 'next/link';
import { FC } from 'react';

interface OwnProps {
  item: {
    proposalId: number;
    proposalTitle: string;
    proposalType: string;
    vote: string;
    votingEnded: string;
  };
}

const NetworkProposalItem: FC<OwnProps> = ({ item }) => {

  return (
    <tr className="group cursor-pointer hover:bg-bgHover">
      <td className="w-2/6 border-b border-black py-4 hover:text-highlight active:border-bgSt">
        <Link href={''} className="flex items-center gap-1">
          <div className="font-handjet text-xl text-highlight">{`#${item.proposalId}`}</div>
          <div className="text-sm">{item.proposalTitle}</div>
        </Link>
      </td>
      <td className="w-1/6 border-b border-black px-2 py-2 text-base hover:text-highlight active:border-bgSt">
        <Link href={''} className="flex justify-center">
          <div className="text-center">{item.proposalType}</div>
        </Link>
      </td>
      <td className="w-1/6 border-b border-black px-2 py-2 text-base hover:text-highlight active:border-bgSt">
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

export default NetworkProposalItem;
