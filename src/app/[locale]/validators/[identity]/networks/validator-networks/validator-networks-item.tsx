import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import TableAvatar from '@/components/common/table/table-avatar';
import icons from '@/components/icons';
import { validatorNodesWithChainData } from '@/services/validator-service';

interface OwnProps {
  item: validatorNodesWithChainData;
}

const ValidatorNetworksItem: FC<OwnProps> = ({ item }) => {
  const fans: number = 23234;
  const uptime: number = 80;
  const missedBlocks: number = 500;
  let infrastructure: boolean = true;
  const rank: number = 15;
  const expectedApr: number = 12;
  const votingPowerPercents: number = 20;
  const tokenDelegatorShares = Number(item.delegator_shares) / 10 ** item.coinDecimals;
  if (item.jailed) {
    infrastructure = false;
  }

  const redTextLayout: string = '#EB1616';
  const greenTextLayout: string = '#4FB848';
  const yellowTextLayout: string = '#E5C46B';

  const selfDelegation: number = Number(item.min_self_delegation) / 10 ** item.coinDecimals;

  const checkSquareIcon = () => {
    if (item.jailed) {
      return icons.RedSquareIcon;
    }
    return icons.GreenSquareIcon;
  };

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
      <td
        className="group/avatar flex items-center border-b border-black px-2 py-2 font-sfpro hover:text-highlight active:border-bgSt">
        <Image src={checkSquareIcon()} alt={'Now'} width={20} height={20} />
        <TableAvatar
          icon={item.logoUrl}
          name={item?.prettyName || 'No name'}
          href={`/networks/${item.chainId.toLowerCase()}`}
        />
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={`/networks/${item.chainId.toLowerCase()}`}>
          <div className="text-center">{expectedApr}%</div>
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={`/networks/${item.chainId.toLowerCase()}`}>
          <div className="text-center">{fans.toLocaleString('en-US')}</div>
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={`/networks/${item.chainId.toLowerCase()}`}>
          <div className="text-center">{rank}</div>
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={`/networks/${item.chainId.toLowerCase()}`}>
          <div className="text-center">
            {tokenDelegatorShares.toLocaleString('en-US', {
              maximumFractionDigits: 0,
            })}
          </div>
          <div className="text-center">{votingPowerPercents}%</div>
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={`/networks/${item.chainId.toLowerCase()}`}>
          <div className="text-center">{Math.trunc(Number(item.rate) * 100)}%</div>
        </Link>
      </td>
      <td className="group border-b border-black px-2 py-2 font-sfpro text-base active:border-bgSt">
        <Link href={`/networks/${item.chainId.toLowerCase()}`}>
          <div className="text-center" style={{ color: checkDelegationColor() }}>
            {selfDelegation.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={`/networks/${item.chainId.toLowerCase()}`}>
          <div className="text-center" style={{ color: checkUptime() }}>
            {uptime}
          </div>
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={`/networks/${item.chainId.toLowerCase()}`}>
          <div className="text-center" style={{ color: checkMissedBlocks() }}>
            {missedBlocks}
          </div>
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base active:border-bgSt">
        <Link href={`/networks/${item.chainId.toLowerCase()}`}>
          <div className="flex items-center justify-center text-center">
            {infrastructure && (
              <Image src={icons.CheckmarkIcon} alt="Infrastructure is active" width={30} height={30} />
            )}
          </div>
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={`/networks/${item.chainId.toLowerCase()}`}>
          <div className="text-center">80</div>
        </Link>
      </td>
    </tr>
  );
};

export default ValidatorNetworksItem;
