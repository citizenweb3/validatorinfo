import { VoteOption } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import BaseTableCell from '@/components/common/table/base-table-cell';
import BaseTableRow from '@/components/common/table/base-table-row';
import colorStylization from '@/utils/color-stylization';

interface OwnProps {
  item: {
    proposalId: string;
    title: string;
    vote: string;
    networkImpact: number;
    timestamp: string;
  };
  chainName: string;
}

const VotingHistoryItem: FC<OwnProps> = ({ item, chainName }) => {
  const proposalLink = `/networks/${chainName}/proposal/${item.proposalId}`;

  return (
    <BaseTableRow>
      <BaseTableCell className="w-1/6 py-4 hover:text-highlight">
        <Link href={proposalLink} className="flex justify-center">
          <div className="font-handjet text-xl text-highlight">#{item.proposalId}</div>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="w-2/6 py-4 text-base">
        <Link href={proposalLink}>
          <div className="font-sfpro">{item.title}</div>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="w-1/6 px-2 py-2 hover:text-highlight">
        <div className="flex items-center justify-center gap-1">
          <Image src={colorStylization.getVotesIcon(item.vote as VoteOption)} alt={item.vote} width={20} height={20} />
          <div className="text-center text-base">{item.vote}</div>
        </div>
      </BaseTableCell>
      <BaseTableCell className="w-1/6 px-2 py-2">
        <div className="flex justify-center">
          <div className="font-handjet text-xl text-highlight">{item.networkImpact}%</div>
        </div>
      </BaseTableCell>
      <BaseTableCell className="w-1/6 px-2 py-2">
        <div className="flex justify-center">
          <div className="text-center text-base">{item.timestamp}</div>
        </div>
      </BaseTableCell>
    </BaseTableRow>
  );
};

export default VotingHistoryItem;
