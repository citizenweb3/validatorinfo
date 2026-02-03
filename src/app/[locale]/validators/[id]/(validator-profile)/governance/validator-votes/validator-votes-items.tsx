import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import BaseTableRow from '@/components/common/table/base-table-row';
import BaseTableCell from '@/components/common/table/base-table-cell';
import { ValidatorVote } from '@/services/vote-service';
import colorStylization from '@/utils/color-stylization';

interface OwnProps {
  item: ValidatorVote;
  validatorId: number;
}

const ValidatorVotesItem: FC<OwnProps> = ({ item, validatorId }) => {
  const chainName = item.chain?.name ?? '';
  const proposalLink = chainName ? `/networks/${chainName}/proposal/${item.proposalId}` : '#';
  const chainLink = chainName ? `/networks/${chainName}/overview` : '#';

  return (
    <BaseTableRow>
      <BaseTableCell className="w-1/4 py-4 font-sfpro text-base hover:text-highlight">
        <Link href={chainLink} className="flex items-center gap-1">
          <Image src={colorStylization.getVotesIcon(item.vote)} alt={`${item.vote}`} width={20} height={20} />
          <div className="text-center">{item.chain.prettyName}</div>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="w-2/4 py-4 text-base">
        <Link href={proposalLink} className="flex gap-2">
          <div className="font-handjet text-xl text-highlight">{`#${item.proposalId}`}</div>
          <div className="">{item.title}</div>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="w-1/4 px-2 py-2 text-base hover:text-highlight">
        <Link href={chainName ? `/networks/${chainName}/governance` : '#'} className="flex justify-center">
          <div className="text-center">{item.vote}</div>
        </Link>
      </BaseTableCell>
    </BaseTableRow>
  );
};

export default ValidatorVotesItem;
