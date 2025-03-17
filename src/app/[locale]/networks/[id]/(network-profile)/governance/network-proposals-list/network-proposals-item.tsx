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
    <tr className="cursor-pointer hover:bg-bgHover">
      <td className="w-1/4 border-b border-black py-4 hover:text-highlight active:border-bgSt pl-7">
        <Link href={''} className="flex items-center gap-1">
          <div className="font-handjet text-xl text-highlight">{`#${item.proposalId}`}</div>
          <div className="text-base">{item.proposalTitle}</div>
        </Link>
      </td>
      <td className="w-1/4 border-b border-black py-4 text-base hover:text-highlight active:border-bgSt">
        <Link href={''} className="flex justify-center">
          <div className="text-center">{item.proposalType}</div>
        </Link>
      </td>
      <td className="w-1/4 border-b border-black py-4 text-base hover:text-highlight active:border-bgSt">
        <Link href={''} className="flex justify-center">
          <div className="text-center">{item.vote}</div>
        </Link>
      </td>
      <td className="w-1/4 border-b border-black py-4 text-base hover:text-highlight active:border-bgSt">
        <Link href={''} className="flex justify-center">
          <div className="font-handjet text-lg text-center">{item.votingEnded}</div>
        </Link>
      </td>
    </tr>
  );
};

export default NetworkProposalItem;
