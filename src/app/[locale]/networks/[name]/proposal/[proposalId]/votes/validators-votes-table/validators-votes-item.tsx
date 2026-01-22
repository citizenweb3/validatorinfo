import Link from 'next/link';
import { FC } from 'react';

import BaseTableRow from '@/components/common/table/base-table-row';
import BaseTableCell from '@/components/common/table/base-table-cell';
import icons from '@/components/icons';
import TableAvatar from '@/components/common/table/table-avatar';
import cutHash from '@/utils/cut-hash';
import { ProposalValidatorsVotes } from '@/services/vote-service';

interface OwnProps {
  item: ProposalValidatorsVotes;
}

const ValidatorsVotesItem: FC<OwnProps> = ({ item }) => {
  const validatorLink = `/validators/${item.validator.id}/networks`;

  return (
    <BaseTableRow>
      <BaseTableCell className="w-1/4 py-2 pl-2 font-sfpro text-base hover:text-highlight">
        <TableAvatar
          icon={item.validator.iconUrl ?? icons.AvatarIcon}
          name={item.validator.moniker}
          href={validatorLink} />
      </BaseTableCell>
      <BaseTableCell className="w-1/4 py-2 font-handjet text-lg hover:text-highlight">
        <Link href={''} className="flex items-center justify-center">
          {item.validator.moniker === 'Validator Name'
            ? cutHash({ value: 'D3DD629470947D318DFCC1D66F8FA8534B0A14164761852D782BB33BEA495660' })
            : '-'}
        </Link>
      </BaseTableCell>
      <BaseTableCell className="w-1/4 py-2 font-sfpro text-base hover:text-highlight">
        <Link href={''} className="flex items-center justify-center">
          {item.vote ?? 'DID NOT VOTE'}
        </Link>
      </BaseTableCell>
      <BaseTableCell className="w-1/4 py-2 font-handjet text-lg hover:text-highlight">
        <Link href={''} className="flex items-center justify-center">
          {item.validator.moniker === 'Validator Name'
            ? 'Dec 20th, 2024 01:46:06 (14 days)'
            : '-'}
        </Link>
      </BaseTableCell>
    </BaseTableRow>
  );
};

export default ValidatorsVotesItem;
