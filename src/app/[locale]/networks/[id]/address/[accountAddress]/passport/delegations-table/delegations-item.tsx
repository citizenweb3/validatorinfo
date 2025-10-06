import { FC } from 'react';

import TableAvatar from '@/components/common/table/table-avatar';
import ChainService, { NetworkValidatorsWithNodes } from '@/services/chain-service';
import ValidatorService from '@/services/validator-service';
import icons from '@/components/icons';
import Link from 'next/link';
import { Node } from '@prisma/client';

interface OwnProps {
  item: {
    validatorId: number;
    stakedAmount: number;
    rewardAmount: number;
    rewardValue: number;
    operatorAddress: string;
  };
  chainId: number;
}

const DelegationsItem: FC<OwnProps> = async ({ item, chainId }) => {
  const validator = await ValidatorService.getById(item.validatorId);
  const chain = await ChainService.getById(chainId);

  const validatorNodePassportLink = `/validators/${item.validatorId}/${item.operatorAddress}/validator_passport/authz/withdraw_rewards`;


  return (
    <tr className="group font-handjet hover:bg-bgHover ">
      <td
        className="group/avatar w-1/4 border-b border-black px-2 py-2 font-sfpro hover:text-highlight active:border-bgSt">
        <TableAvatar
          icon={validator?.url ?? icons.AvatarIcon}
          name={validator?.moniker ?? 'Validator'}
          href={validatorNodePassportLink}
        />
      </td>
      <td className="w-1/4 border-b border-black px-2 py-2 font-handjet text-lg active:border-bgSt hover:text-highlight">
        <Link href={validatorNodePassportLink}>
          <div className="text-center">{item.stakedAmount.toFixed(6)} {chain?.params?.denom}</div>
        </Link>
      </td>
      <td className="w-1/4 border-b border-black px-2 py-2 font-handjet text-lg active:border-bgSt hover:text-highlight">
        <Link href={validatorNodePassportLink}>
          <div className="text-center">{item.rewardAmount.toFixed(6)} {chain?.params?.denom}</div>
        </Link>
      </td>
      <td className="w-1/4 border-b border-black px-2 py-2 font-handjet text-lg active:border-bgSt hover:text-highlight">
        <Link href={validatorNodePassportLink}>
          <div className="text-center">${item.rewardValue.toFixed(2)}</div>
        </Link>
      </td>
    </tr>
  );
};

export default DelegationsItem;
