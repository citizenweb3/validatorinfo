import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import TableAvatar from '@/components/common/table/table-avatar';
import Tooltip from '@/components/common/tooltip';
import icons from '@/components/icons';
import { NetworkValidatorsWithNodes } from '@/services/chain-service';
import colorStylization from '@/utils/color-stylization';
import formatCash from '@/utils/format-cash';

interface OwnProps {
  item: NetworkValidatorsWithNodes;
}

const NetworkValidatorsItem: FC<OwnProps> = async ({ item }) => {
  const tokenDelegatorShares =
    item.chain.params?.coinDecimals != null ? +item.delegatorShares / 10 ** item.chain.params?.coinDecimals : undefined;

  const selfDelegation =
    item.chain.params?.coinDecimals != null
      ? +item.minSelfDelegation / 10 ** item.chain.params?.coinDecimals
      : undefined;

  const nodeLink = `/validators/${item.validatorId}/networks`;

  const totalSlots = item.totalSlots;

  const chainsWithSlots = ['ethereum', 'ethereum-sepolia', 'aztec', 'aztec-testnet'];

  return (
    <tr className="group cursor-pointer font-handjet hover:bg-bgHover">
      <td className="group/avatar flex items-center border-b border-black px-2 py-2 font-sfpro hover:text-highlight active:border-bgSt">
        <Image
          src={item?.jailed ? icons.RedSquareIcon : icons.GreenSquareIcon}
          alt={'node status'}
          width={20}
          height={20}
        />
        <TableAvatar
          icon={item.validator?.url ?? icons.AvatarIcon}
          name={item.validator?.moniker ?? item.moniker}
          href={nodeLink}
        />
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={nodeLink}>
          <Tooltip tooltip={tokenDelegatorShares?.toLocaleString() ?? ''}>
            <div className="text-center">{tokenDelegatorShares ? formatCash(tokenDelegatorShares) : ''}</div>
          </Tooltip>
          <div className="text-center">{item.votingPower.toFixed(2)}%</div>
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={nodeLink}>
          <div className="text-center">{(Number(item.rate) * 100).toFixed(2)}%</div>
        </Link>
      </td>
      <td className="group border-b border-black px-2 py-2 font-sfpro text-base active:border-bgSt">
        <Link href={nodeLink}>
          <Tooltip tooltip={selfDelegation?.toLocaleString() ?? ''}>
            <div className="text-center" style={{ color: colorStylization.delegation(selfDelegation ?? null) }}>
              {selfDelegation !== undefined && selfDelegation !== null ? formatCash(selfDelegation) : '-'}
            </div>
          </Tooltip>
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base active:border-bgSt">
        {item.uptime !== undefined && item.uptime !== null ? (
          <Tooltip
            tooltip={`Per 
          ${totalSlots ? totalSlots.toLocaleString() : item.chain.params?.blocksWindow?.toLocaleString()}
          ${chainsWithSlots.includes(item.chain.name) ? 'slots' : 'blocks'} 
          `}
          >
            <div className="text-center" style={{ color: colorStylization.uptime(item.uptime) }}>
              {item.uptime.toFixed(2)}
            </div>
          </Tooltip>
        ) : (
          <div className="text-center">-</div>
        )}
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base active:border-bgSt">
        {item.missedBlocks !== undefined && item.missedBlocks !== null ? (
          <Tooltip
            tooltip={`Per 
          ${totalSlots ? totalSlots.toLocaleString() : item.chain.params?.blocksWindow?.toLocaleString()}
          ${chainsWithSlots.includes(item.chain.name) ? 'slots' : 'blocks'} 
          `}
          >
            <div className="text-center">{item.missedBlocks}</div>
          </Tooltip>
        ) : (
          <div className="text-center">-</div>
        )}
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

export default NetworkValidatorsItem;
