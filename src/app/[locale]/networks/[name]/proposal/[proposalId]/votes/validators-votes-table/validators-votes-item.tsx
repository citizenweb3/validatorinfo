import Link from 'next/link';
import { FC } from 'react';

import BaseTableRow from '@/components/common/table/base-table-row';
import BaseTableCell from '@/components/common/table/base-table-cell';
import icons from '@/components/icons';
import TableAvatar from '@/components/common/table/table-avatar';
import cutHash from '@/utils/cut-hash';
import { ProposalValidatorsVotes } from '@/services/vote-service';
import CopyButton from '@/components/common/copy-button';

interface OwnProps {
  item: ProposalValidatorsVotes;
  chainName: string;
}

const ValidatorsVotesItem: FC<OwnProps> = ({ item, chainName }) => {
  const validatorLink = `/validators/${item.validator.id}/networks`;

  return (
    <BaseTableRow>
      <BaseTableCell className="w-1/3 py-2 pl-2 font-sfpro text-base hover:text-highlight">
        <TableAvatar
          icon={item.validator.iconUrl ?? icons.AvatarIcon}
          name={item.validator.moniker}
          href={validatorLink} />
      </BaseTableCell>
      <BaseTableCell className="w-1/3 py-2 font-handjet text-lg hover:text-highlight">
        <div className="flex items-center justify-center">
          {item.txHash ? (
            <>
              <Link href={`/networks/${chainName}/tx/${item.txHash}`} className="flex items-center justify-center">
                {cutHash({ value: item.txHash })}
              </Link>
              <CopyButton value={item.txHash} />
            </>
          ) : (
            '-'
          )}
        </div>
      </BaseTableCell>
      <BaseTableCell className="w-1/3 py-2 font-sfpro text-base">
        <div className="flex items-center justify-center">
          {item.vote ?? 'DID NOT VOTE'}
        </div>
      </BaseTableCell>
    </BaseTableRow>
  );
};

export default ValidatorsVotesItem;
