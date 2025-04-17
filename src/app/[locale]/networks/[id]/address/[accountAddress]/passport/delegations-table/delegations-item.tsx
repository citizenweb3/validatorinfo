import { FC } from 'react';

import TableAvatar from '@/components/common/table/table-avatar';
import ChainService from '@/services/chain-service';
import ValidatorService from '@/services/validator-service';
import icons from '@/components/icons';
import Link from 'next/link';

interface OwnProps {
  item: {
    validatorId: number;
    stakedAmount: number;
    rewardAmount: number;
    rewardValue: number;
  };
  chainId: number;
}

const DelegationsItem: FC<OwnProps> = async ({ item, chainId }) => {
  const validator = await ValidatorService.getById(item.validatorId);
  const chain = await ChainService.getById(chainId);

  const validatorLink = `/validators/${item.validatorId}/networks`;

  return (
    <tr className="group font-handjet hover:bg-bgHover ">
      <td
        className="group/avatar w-1/4 border-b border-black px-2 py-2 font-sfpro hover:text-highlight active:border-bgSt">
        <TableAvatar
          icon={validator?.url ?? icons.AvatarIcon}
          name={validator?.moniker ?? 'Validator'}
          href={validatorLink}
        />
      </td>
      <td className="w-1/4 border-b border-black px-2 py-2 font-handjet text-lg active:border-bgSt hover:text-highlight">
        <Link href={validatorLink}>
          <div className="text-center">{item.stakedAmount.toFixed(6)} {chain?.denom}</div>
        </Link>
      </td>
      <td className="w-1/4 border-b border-black px-2 py-2 font-handjet text-lg active:border-bgSt hover:text-highlight">
        <Link href={validatorLink}>
          <div className="text-center">{item.rewardAmount.toFixed(6)} {chain?.denom}</div>
        </Link>
      </td>
      <td className="w-1/4 border-b border-black px-2 py-2 font-handjet text-lg active:border-bgSt hover:text-highlight">
        <Link href={validatorLink}>
          <div className="text-center">${item.rewardValue.toFixed(2)}</div>
        </Link>
      </td>
    </tr>
  );
};

export default DelegationsItem;
