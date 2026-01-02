import Link from 'next/link';
import { FC } from 'react';

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
    <tr className="cursor-pointer font-handjet hover:bg-bgHover">
      <td className="border-b border-black px-4 py-3 font-sfpro hover:text-highlight active:border-bgSt">
        <TableAvatar icon={member.validator?.url ?? icons.AvatarIcon} name={displayName} href={validatorLink} />
      </td>
      <td className="border-b border-black px-4 py-3 text-center active:border-bgSt">
        <Link href={nodeLink}>
          <div className="font-handjet text-lg hover:text-highlight">{member.operatorAddress}</div>
        </Link>
      </td>
      <td className="border-b border-black px-4 py-3 text-center active:border-bgSt">
        <Link href={nodeLink}>
          <div className="font-handjet text-lg hover:text-highlight">{member.rewardAddress ?? '-'}</div>
        </Link>
      </td>
    </tr>
  );
};

export default CommitteeTableItem;
