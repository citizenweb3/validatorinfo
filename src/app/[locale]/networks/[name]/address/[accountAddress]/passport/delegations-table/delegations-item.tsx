import Link from 'next/link';
import { FC } from 'react';

import TableAvatar from '@/components/common/table/table-avatar';
import icons from '@/components/icons';
import ChainService from '@/services/chain-service';
import ValidatorService from '@/services/validator-service';

interface OwnProps {
  item: {
    validatorId: number;
    stakedAmount: number;
    rewardAmount: number;
    rewardValue: number;
    operatorAddress: string;
  };
  chainName: string;
}

const DelegationsItem: FC<OwnProps> = async ({ item, chainName }) => {
  const validator = await ValidatorService.getById(item.validatorId);
  const chain = await ChainService.getByName(chainName);

  const validatorNodePassportLink = `/validators/${item.validatorId}/${item.operatorAddress}/validator_passport/authz/withdraw_rewards`;

  return (
    <tr className="group font-handjet hover:bg-bgHover ">
      <td className="group/avatar w-1/4 border-b border-black px-2 py-2 font-sfpro hover:text-highlight active:border-bgSt">
        <TableAvatar
          icon={validator?.url ?? icons.AvatarIcon}
          name={validator?.moniker ?? 'Validator'}
          href={validatorNodePassportLink}
        />
      </td>
      <td className="w-1/4 border-b border-black px-2 py-2 font-handjet text-lg hover:text-highlight active:border-bgSt">
        <Link href={validatorNodePassportLink}>
          <div className="text-center">
            {item.stakedAmount.toFixed(6)} {chain?.params?.denom}
          </div>
        </Link>
      </td>
      <td className="w-1/4 border-b border-black px-2 py-2 font-handjet text-lg hover:text-highlight active:border-bgSt">
        <Link href={validatorNodePassportLink}>
          <div className="text-center">
            {item.rewardAmount.toFixed(6)} {chain?.params?.denom}
          </div>
        </Link>
      </td>
      <td className="w-1/4 border-b border-black px-2 py-2 font-handjet text-lg hover:text-highlight active:border-bgSt">
        <Link href={validatorNodePassportLink}>
          <div className="text-center">${item.rewardValue.toFixed(2)}</div>
        </Link>
      </td>
    </tr>
  );
};

export default DelegationsItem;
