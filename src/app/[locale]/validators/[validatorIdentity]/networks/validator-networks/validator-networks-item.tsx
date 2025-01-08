'use client';

import { Chain } from '@prisma/client';
import { router } from 'next/client';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import TableAvatar from '@/components/common/table/table-avatar';
import icons from '@/components/icons';

interface OwnProps {
  item: {
    color: string;
    chainId: string;
    name: string;
    prettyName: string;
    logoUrl: string;
    apr: number;
    fans: number;
    rank: number;
    delegator_shares: number;
    percentsVotingPower: number;
    rate: number;
    min_self_delegation: number;
    uptime: number;
    missedBlocks: number;
    infrastructure: boolean;
    governance: number;
  };
}

const ValidatorNetworksItem: FC<OwnProps> = ({ item }) => {
  const getSquareIcon = () => {
    switch (item.color) {
      case 'green':
        return icons.GreenSquareIcon;
      case 'red':
        return icons.RedSquareIcon;
      case 'yellow':
        return icons.YellowSquareIcon;
      default:
        return icons.GreenSquareIcon;
    }
  };

  const checkDelegationColor = () => {
    if (item.min_self_delegation < 1000) {
      return '#4FB848';
    } else if (item.min_self_delegation < 2000 && item.min_self_delegation >= 1000) {
      return '#E5C46B';
    } else {
      return '#EB1616';
    }
  };

  const checkUptime = () => {
    if (item.uptime <= 90) {
      return '#EB1616';
    } else if (item.uptime >= 90 && item.uptime <= 98) {
      return '#E5C46B';
    } else {
      return '#4FB848';
    }
  };

  const checkMissedBlocks = () => {
    if (item.missedBlocks < 200) {
      return '#4FB848';
    } else if (item.missedBlocks >= 200 && item.missedBlocks <= 2000) {
      return '#E5C46B';
    } else {
      return '#EB1616';
    }
  };

  return (
    <tr className="group cursor-pointer font-handjet hover:bg-bgHover">
      <td className="group/avatar border-b border-black px-2 py-2 font-sfpro hover:text-highlight active:border-bgSt">
        <Link href={`/networks/${item.name.toLowerCase()}`} className="flex items-center">
          <Image src={getSquareIcon()} alt={`${item.color}`} width={20} height={20} />
          <TableAvatar icon={item.logoUrl} name={item.prettyName} href={`/networks/${item.name}`} />
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={`/networks/${item.name.toLowerCase()}`}>
          <div className="text-center">{item.apr}%</div>
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={`/networks/${item.name.toLowerCase()}`}>
          <div className="text-center">{item.fans.toLocaleString('en-US')}</div>
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={`/networks/${item.name.toLowerCase()}`}>
          <div className="text-center">{item.rank}</div>
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={`/networks/${item.name.toLowerCase()}`}>
          <div className="text-center">{item.delegator_shares.toLocaleString('en-US')}</div>
          <div className="text-center">{item.percentsVotingPower}%</div>
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={`/networks/${item.name.toLowerCase()}`}>
          <div className="text-center">{item.rate}%</div>
        </Link>
      </td>
      <td className="group border-b border-black px-2 py-2 font-sfpro text-base active:border-bgSt">
        <Link href={`/networks/${item.name.toLowerCase()}`}>
          <div className="text-center" style={{ color: checkDelegationColor() }}>
            {item.min_self_delegation.toLocaleString('en-US')}
          </div>
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={`/networks/${item.name.toLowerCase()}`}>
          <div className="text-center" style={{ color: checkUptime() }}>
            {item.uptime}%
          </div>
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={`/networks/${item.name.toLowerCase()}`}>
          <div className="text-center" style={{ color: checkMissedBlocks() }}>
            {item.missedBlocks}
          </div>
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base active:border-bgSt">
        <Link href={`/networks/${item.name.toLowerCase()}`}>
          <div className="flex items-center justify-center text-center">
            {item.infrastructure && (
              <Image src={icons.CheckmarkIcon} alt="Infrastructure is active" width={30} height={30} />
            )}
          </div>
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={`/networks/${item.name.toLowerCase()}`}>
          <div className="text-center">{item.governance}</div>
        </Link>
      </td>
    </tr>
  );
};

export default ValidatorNetworksItem;
