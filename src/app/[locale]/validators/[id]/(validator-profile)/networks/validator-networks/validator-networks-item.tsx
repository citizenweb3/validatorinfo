import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import TableAvatar from '@/components/common/table/table-avatar';
import Tooltip from '@/components/common/tooltip';
import icons from '@/components/icons';
import { validatorNodesWithChainData } from '@/services/validator-service';
import formatCash from '@/utils/format-cash';
import colorStylization from '@/utils/color-stylization';

interface OwnProps {
  item: validatorNodesWithChainData;
}

const ValidatorNetworksItem: FC<OwnProps> = ({ item }) => {
  const fans: number = 23234;
  const rank: number = 15;

  const selfDelegation = item.chain.params?.coinDecimals
    ? +item.minSelfDelegation / 10 ** item.chain.params?.coinDecimals
    : undefined;

  const tokenDelegatorShares = item.chain.params?.coinDecimals
    ? +item.delegatorShares / 10 ** item.chain.params?.coinDecimals
    : undefined;

  const expectedApr = (+item.chain.apr - (+item.chain.apr * +item.rate)) * 100;

  const nodeLink = `/validators/${item.validatorId}/${item.operatorAddress}/validator_passport/authz/withdraw_rewards`;


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
        <TableAvatar icon={item.chain.logoUrl} name={item.chain.prettyName || 'No name'} href={nodeLink} />
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={nodeLink}>
          <div className="text-center">{expectedApr.toFixed(2)}%</div>
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
            <Tooltip tooltip={tokenDelegatorShares?.toLocaleString() ?? ''}>
              {tokenDelegatorShares ? formatCash(tokenDelegatorShares) : ''}
            </Tooltip>
          </div>
          <div className="text-center">{item.votingPower.toFixed(2)}%</div>
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={nodeLink}>
          <div className="text-center">{Math.trunc(Number(item.rate) * 100)}%</div>
        </Link>
      </td>
      <td className="group border-b border-black px-2 py-2 font-sfpro text-base active:border-bgSt">
        <Link href={nodeLink}>
          <Tooltip tooltip={selfDelegation?.toLocaleString() ?? ''}>
            <div className="text-center" style={{ color: colorStylization.delegation(selfDelegation ?? null) }}>
              {selfDelegation ? formatCash(selfDelegation) : ''}
            </div>
          </Tooltip>
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base active:border-bgSt">
        {item.uptime ? (
          <Tooltip tooltip={`Per ${item.chain.params?.blocksWindow?.toLocaleString()} blocks`}>
            <div className="text-center" style={{ color: colorStylization.uptime(item.uptime) }}>
              {item.uptime.toFixed(2)}
            </div>
          </Tooltip>
        ) : (
          <div className="text-center">
            -
          </div>
        )}
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base active:border-bgSt">
        {item.missedBlocks !== undefined && item.missedBlocks !== null ? (
          <Tooltip tooltip={`Per ${item.chain.params?.blocksWindow?.toLocaleString()} blocks`}>
            <div className="text-center" style={{ color: colorStylization.missedBlocks(item.missedBlocks) }}>
              {item.missedBlocks}
            </div>
          </Tooltip>
        ) : (
          <div className="text-center">
            -
          </div>
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

export default ValidatorNetworksItem;
