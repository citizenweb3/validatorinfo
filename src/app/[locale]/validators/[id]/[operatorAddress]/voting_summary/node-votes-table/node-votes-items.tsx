import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import BaseTableRow from '@/components/common/table/base-table-row';
import BaseTableCell from '@/components/common/table/base-table-cell';
import { ChainNodeVote } from '@/services/vote-service';
import colorStylization from '@/utils/color-stylization';
import { parseMessage } from '@/utils/parse-proposal-message';

interface OwnProps {
  item: ChainNodeVote;
}

const NodeVotesItem: FC<OwnProps> = ({ item }) => {
  const proposalLink = `/networks/${item.chainName}/proposal/${item.proposalId}`;

  return (
    <BaseTableRow>
      <BaseTableCell className="w-2/6 py-4 hover:text-highlight">
        <Link href={proposalLink} className="flex items-center gap-1">
          <Image src={colorStylization.getVotesIcon(item.vote)} alt={`${item.vote}`} width={30} height={30} />
          <div className="mx-4 font-handjet text-xl text-highlight">{`#${item.proposalId}`}</div>
          <div className="font-sfpro text-base">{item.title}</div>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="w-1/6 px-2 py-2 text-base hover:text-highlight">
        <Link href={proposalLink} className="flex justify-center">
          <div className="text-center">{parseMessage(item.proposalType)}</div>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="w-1/6 px-2 py-2 text-base hover:text-highlight">
        <Link href={proposalLink} className="flex justify-center">
          <div className="text-center">{item.vote}</div>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="w-2/6 px-2 py-2 text-base hover:text-highlight">
        <Link href={proposalLink} className="flex justify-center">
          {item.votingEndTime ? (
            <div className="text-center font-handjet text-lg">
              {new Date(item.votingEndTime).toDateString().split(' ').slice(1, 4).join(' ')},{' '}
              {new Date(item.votingEndTime).toTimeString().split(' ').slice(0, 2).join(' ')}
            </div>
          ) : (
            <div className="text-center">21/02/2024, 22:01:15</div>
          )}
        </Link>
      </BaseTableCell>
    </BaseTableRow>
  );
};

export default NodeVotesItem;
