import Link from 'next/link';
import { FC } from 'react';

import BaseTableCell from '@/components/common/table/base-table-cell';
import BaseTableRow from '@/components/common/table/base-table-row';
import TableAvatar from '@/components/common/table/table-avatar';
import icons from '@/components/icons';
import { CommitteeMember } from '@/services/chain-service';

interface OwnProps {
  member: CommitteeMember;
}

const CommitteeTableItem: FC<OwnProps> = ({ member }) => {
  const validatorLink = member.validator?.id ? `/validators/${member.validator.id}/networks` : '#';
  const displayName = member.validator?.moniker ?? member.moniker;

  const nodeLink = `/validators/${member.validator?.id}/${member.operatorAddress}/validator_passport/authz/withdraw_rewards`;

  return (
    <BaseTableRow>
      <BaseTableCell className="px-4 py-3 font-sfpro hover:text-highlight">
        <TableAvatar icon={member.validator?.url ?? icons.AvatarIcon} name={displayName} href={validatorLink} />
      </BaseTableCell>
      <BaseTableCell className="px-4 py-3 text-center">
        <Link href={nodeLink}>
          <div className="font-handjet text-lg hover:text-highlight">{member.operatorAddress}</div>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="px-4 py-3 text-center">
        <Link href={nodeLink}>
          <div className="font-handjet text-lg hover:text-highlight">{member.rewardAddress ?? '-'}</div>
        </Link>
      </BaseTableCell>
    </BaseTableRow>
  );
};

export default CommitteeTableItem;
