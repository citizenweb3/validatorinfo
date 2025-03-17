import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import TableAvatar from '@/components/common/table/table-avatar';
import Tooltip from '@/components/common/tooltip';
import icons from '@/components/icons';
import { validatorNodesWithChainData } from '@/services/validator-service';
import formatCash from '@/utils/format-cash';

interface OwnProps {
  item: validatorNodesWithChainData;
}

const ValidatorNetworksItem: FC<OwnProps> = ({ item }) => {
  const fans: number = 23234;
  const uptime: number = 80;
  const missedBlocks: number = 500;
  const rank: number = 15;
  const expectedApr: number = 12;
  const votingPowerPercents: number = 20;
  const tokenDelegatorShares = Number(item.delegatorShares) / 10 ** item.coinDecimals;

  const redTextLayout: string = '#EB1616';
  const greenTextLayout: string = '#4FB848';
  const yellowTextLayout: string = '#E5C46B';

  const selfDelegation: number = Number(item.minSelfDelegation) / 10 ** item.coinDecimals;

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
    if (uptime <= 90) {
      return redTextLayout;
    } else if (uptime >= 90 && uptime <= 98) {
      return yellowTextLayout;
    } else {
      return greenTextLayout;
    }
  };

  const checkMissedBlocks = () => {
    if (missedBlocks < 200) {
      return greenTextLayout;
    } else if (missedBlocks >= 200 && missedBlocks <= 2000) {
      return yellowTextLayout;
    } else {
      return redTextLayout;
    }
  };

  return (
    <tr className="group cursor-pointer font-handjet hover:bg-bgHover">
      <td className="group/avatar flex items-center border-b border-black px-2 py-2 font-sfpro hover:text-highlight active:border-bgSt">
        <Image
          src={item?.jailed ? icons.RedSquareIcon : icons.GreenSquareIcon}
          alt={'node status'}
          width={20}
          height={20}
        />
        <TableAvatar icon={item.logoUrl} name={item?.prettyName || 'No name'} href={nodeLink} />
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={nodeLink}>
          <div className="text-center">{expectedApr}%</div>
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={nodeLink}>
          <div className="text-center">{fans.toLocaleString('en-US')}</div>
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={nodeLink}>
          <div className="text-center">{rank}</div>
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={nodeLink}>
          <div className="text-center">
            <Tooltip tooltip={tokenDelegatorShares.toLocaleString()}>{formatCash(tokenDelegatorShares)}</Tooltip>
          </div>
          <div className="text-center">{votingPowerPercents}%</div>
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={nodeLink}>
          <div className="text-center">{Math.trunc(Number(item.rate) * 100)}%</div>
        </Link>
      </td>
      <td className="group border-b border-black px-2 py-2 font-sfpro text-base active:border-bgSt">
        <Link href={nodeLink}>
          <Tooltip tooltip={tokenDelegatorShares.toLocaleString()}>
            <div className="text-center" style={{ color: checkDelegationColor() }}>
              {formatCash(tokenDelegatorShares)}
            </div>
          </Tooltip>
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={nodeLink}>
          <div className="text-center" style={{ color: checkUptime() }}>
            {uptime}
          </div>
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={nodeLink}>
          <div className="text-center" style={{ color: checkMissedBlocks() }}>
            {missedBlocks}
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
      <td className="border-b border-black px-2 py-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={nodeLink}>
          <div className="text-center">80</div>
        </Link>
      </td>
    </tr>
  );
};

export default ValidatorNetworksItem;
