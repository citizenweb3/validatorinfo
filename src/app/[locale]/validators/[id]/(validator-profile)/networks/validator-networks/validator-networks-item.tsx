import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import BaseTableRow from '@/components/common/table/base-table-row';
import BaseTableCell from '@/components/common/table/base-table-cell';
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
  const rank: number = 15;

  const selfDelegation = item.chain.params?.coinDecimals != null
    ? +item.minSelfDelegation / 10 ** item.chain.params?.coinDecimals
    : undefined;

  const tokenDelegatorShares = item.chain.params?.coinDecimals != null
    ? +item.delegatorShares / 10 ** item.chain.params?.coinDecimals
    : undefined;

  const expectedApr = item?.chain?.tokenomics?.apr
    ? (+item.chain?.tokenomics?.apr - (+item.chain.tokenomics.apr * +item.rate)) * 100
    : undefined;

  const nodeLink = `/validators/${item.validatorId}/${item.operatorAddress}/validator_passport/authz/withdraw_rewards`;

  const totalSlots = item.consensusData?.totalSlots;

  const chainsWithSlots = ['ethereum', 'ethereum-sepolia', 'aztec', 'aztec-testnet'];


  return (
    <BaseTableRow>
      <BaseTableCell className="group/avatar flex items-center px-2 py-2 font-sfpro hover:text-highlight">
        <Image
          src={item?.jailed ? icons.RedSquareIcon : icons.GreenSquareIcon}
          alt={'node status'}
          width={20}
          height={20}
        />
        <TableAvatar icon={item.chain.logoUrl} name={item.chain.prettyName || 'No name'} href={nodeLink} />
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-sfpro text-base hover:text-highlight">
        {expectedApr ? (
            <Link href={nodeLink}>
              <div className="text-center">{expectedApr.toFixed(2)}%</div>
            </Link>
          )
          : (<div className="text-center">-</div>)}
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-sfpro text-base hover:text-highlight">
        <Link href={nodeLink}>
          <div className="text-center">{item?.delegatorsAmount?.toLocaleString('en-US') ?? `N/A`}</div>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-sfpro text-base hover:text-highlight">
        <Link href={nodeLink}>
          <div className="text-center">{rank}</div>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-sfpro text-base hover:text-highlight">
        <Link href={nodeLink}>
          <div className="text-center">
            <Tooltip tooltip={tokenDelegatorShares?.toLocaleString() ?? ''}>
              {tokenDelegatorShares ? formatCash(tokenDelegatorShares) : ''}
            </Tooltip>
          </div>
          <div className="text-center">{item.votingPower.toFixed(2)}%</div>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-sfpro text-base hover:text-highlight">
        <Link href={nodeLink}>
          <div className="text-center">{(Number(item.rate) * 100).toFixed(2)}%</div>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-sfpro text-base">
        <Link href={nodeLink}>
          <Tooltip tooltip={selfDelegation?.toLocaleString() ?? ''}>
            <div className="text-center" style={{ color: colorStylization.delegation(selfDelegation ?? null) }}>
              {selfDelegation != null || selfDelegation != undefined ? formatCash(selfDelegation) : '-'}
            </div>
          </Tooltip>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-sfpro text-base">
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
          <div className="text-center">
            -
          </div>
        )}
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-sfpro text-base">
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
          <div className="text-center">
            -
          </div>
        )}
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-sfpro text-base">
        <Link href={nodeLink}>
          <div className="flex items-center justify-center text-center">
            {!item.jailed && <Image src={icons.CheckmarkIcon} alt="Infrastructure is active" width={30} height={30} />}
          </div>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-sfpro text-base hover:text-highlight">
        <Link href={nodeLink}>
          <div className="text-center">80</div>
        </Link>
      </BaseTableCell>
    </BaseTableRow>
  );
};

export default ValidatorNetworksItem;
