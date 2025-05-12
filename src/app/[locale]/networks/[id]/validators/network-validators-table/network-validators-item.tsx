import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import TableAvatar from '@/components/common/table/table-avatar';
import icons from '@/components/icons';
import { NetworkValidatorsWithNodes } from '@/services/chain-service';
import formatCash from '@/utils/format-cash';
import Tooltip from '@/components/common/tooltip';

interface OwnProps {
  item: NetworkValidatorsWithNodes;
}

const NetworkValidatorsItem: FC<OwnProps> = ({ item }) => {
  const tokenDelegatorShares = +item.delegatorShares / 10 ** item.chain.coinDecimals;

  const redTextLayout: string = '#EB1616';
  const greenTextLayout: string = '#4FB848';
  const yellowTextLayout: string = '#E5C46B';

  const selfDelegation: number = +item.minSelfDelegation / 10 ** item.chain.coinDecimals;

  const nodeLink = `/validators/${item.validatorId}/${item.operatorAddress}/validator_passport/authz/withdraw_rewards`;

  const checkDelegationColor = () => {
    if (Number(selfDelegation) < 1000) {
      return greenTextLayout;
    } else if (Number(selfDelegation) < 2000 && Number(selfDelegation) >= 1000) {
      return yellowTextLayout;
    } else {
      return redTextLayout;
    }
  };

  const checkUptime = () => {
    if (item.uptime != null) {
      if (item.uptime <= 90) {
        return redTextLayout;
      } else if (item.uptime >= 90 && item.uptime <= 98) {
        return yellowTextLayout;
      } else {
        return greenTextLayout;
      }
    }
  };

  const checkMissedBlocks = () => {
    if (item.missedBlocks != null) {
      if (item.missedBlocks < 200) {
        return greenTextLayout;
      } else if (item.missedBlocks >= 200 && item.missedBlocks <= 1000) {
        return yellowTextLayout;
      } else {
        return redTextLayout;
      }
    }
  };

  return (
    <tr className="group cursor-pointer font-handjet hover:bg-bgHover">
      <td
        className="group/avatar flex items-center border-b border-black px-2 py-2 font-sfpro hover:text-highlight active:border-bgSt">
        <Image
          src={item?.jailed ? icons.RedSquareIcon : icons.GreenSquareIcon}
          alt={'node status'}
          width={20}
          height={20}
        />
        <TableAvatar icon={item.validator?.url ?? icons.AvatarIcon} name={item.moniker} href={nodeLink} />
      </td>
      <td
        className="border-b border-black px-2 py-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={nodeLink}>
          <Tooltip tooltip={tokenDelegatorShares.toLocaleString()}>
            <div className="text-center">
              {formatCash(tokenDelegatorShares)}
            </div>
          </Tooltip>
          <div className="text-center">{item.votingPower.toFixed(2)}%</div>
        </Link>
      </td>
      <td
        className="border-b border-black px-2 py-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={nodeLink}>
          <div className="text-center">{Math.trunc(Number(item.rate) * 100)}%</div>
        </Link>
      </td>
      <td className="group border-b border-black px-2 py-2 font-sfpro text-base active:border-bgSt">
        <Link href={nodeLink}>
          <Tooltip tooltip={selfDelegation.toLocaleString()}>
            <div className="text-center" style={{ color: checkDelegationColor() }}>
              {formatCash(selfDelegation)}
            </div>
          </Tooltip>
        </Link>
      </td>
      <td
        className="border-b border-black px-2 py-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={nodeLink}>
          <div className="text-center" style={{ color: checkUptime() }}>
            {item.uptime ? item.uptime.toFixed(2) : '-'}
          </div>
        </Link>
      </td>
      <td
        className="border-b border-black px-2 py-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={nodeLink}>
          <div className="text-center" style={{ color: checkMissedBlocks() }}>
            {item.missedBlocks ?? '-'}
          </div>
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base active:border-bgSt">
        <Link href={nodeLink}>
          <div className="flex items-center justify-center text-center">
            {!item.jailed && <Image src={icons.CheckmarkIcon} alt="Infrastructure is active" width={30} height={30} />}
          </div>
        </Link>
      </td>
      <td
        className="border-b border-black px-2 py-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={nodeLink}>
          <div className="text-center">80</div>
        </Link>
      </td>
    </tr>
  );
};

export default NetworkValidatorsItem;
