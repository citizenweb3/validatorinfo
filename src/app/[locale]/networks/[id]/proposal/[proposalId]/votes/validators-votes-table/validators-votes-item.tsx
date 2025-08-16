import Link from 'next/link';
import { FC } from 'react';
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
    <tr className="group cursor-pointer hover:bg-bgHover">
      <td className="w-1/4 border-b border-black py-2 pl-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <TableAvatar
          icon={item.validator.iconUrl ?? icons.AvatarIcon}
          name={item.validator.moniker}
          href={validatorLink} />
      </td>
      <td
        className="w-1/4 border-b border-black py-2 font-handjet text-lg hover:text-highlight active:border-bgSt">
        <Link href={''} className="flex items-center justify-center">
          {item.validator.moniker === 'Validator Name'
            ? cutHash({ value: 'D3DD629470947D318DFCC1D66F8FA8534B0A14164761852D782BB33BEA495660' })
            : '-'}
        </Link>
      </td>
      <td className="w-1/4 border-b border-black py-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={''} className="flex items-center justify-center">
          {item.vote ?? 'DID NOT VOTE'}
        </Link>
      </td>
      <td className="w-1/4 border-b border-black py-2 font-handjet text-lg hover:text-highlight active:border-bgSt">
        <Link href={''} className="flex items-center justify-center">
          {item.validator.moniker === 'Validator Name'
            ? 'Dec 20th, 2024 01:46:06 (14 days)'
            : '-'}
        </Link>
      </td>
    </tr>
  );
};

export default ValidatorsVotesItem;
