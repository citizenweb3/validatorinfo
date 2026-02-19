import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import BaseTableRow from '@/components/common/table/base-table-row';
import BaseTableCell from '@/components/common/table/base-table-cell';
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

  const activeTokens =
    item.chain.params?.coinDecimals != null ? +item.tokens / 10 ** item.chain.params?.coinDecimals : undefined;

  const bondedTokens = parseFloat(item.chain?.tokenomics?.bondedTokens || '0');
  const votingPowerActive = bondedTokens !== 0 && activeTokens !== undefined ? (activeTokens / bondedTokens) * 100 : 0;

  const selfDelegation =
    item.chain.params?.coinDecimals != null
      ? +item.minSelfDelegation / 10 ** item.chain.params?.coinDecimals
      : undefined;

  const nodeLink = `/validators/${item.validatorId}/networks`;

  const totalSlots = item.totalSlots;

  const chainsWithSlots = ['ethereum', 'ethereum-sepolia', 'aztec', 'aztec-testnet'];

  const hasTokens = BigInt(item.tokens) > BigInt(0);
  const isAztecNetwork = ['aztec', 'aztec-testnet'].includes(item.chain.name);

  const getStatusIcon = () => {
    if (isAztecNetwork) {
      return hasTokens ? icons.GreenSquareIcon : icons.YellowSquareIcon;
    }
    return item.jailed ? icons.RedSquareIcon : icons.GreenSquareIcon;
  };

  return (
    <BaseTableRow>
      <BaseTableCell className="group/avatar flex items-center px-2 py-2 font-sfpro hover:text-highlight">
        <Image src={getStatusIcon()} alt={'node status'} width={20} height={20} />
        <TableAvatar
          icon={item.validator?.url ?? icons.AvatarIcon}
          name={item.validator?.moniker ?? item.moniker}
          href={nodeLink}
        />
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-sfpro text-base hover:text-highlight">
        <Link href={nodeLink}>
          <Tooltip tooltip={tokenDelegatorShares?.toLocaleString() ?? ''}>
            <div className="text-center">{tokenDelegatorShares ? formatCash(tokenDelegatorShares) : ''}</div>
          </Tooltip>
          <div className="text-center">{item.votingPower.toFixed(2)}%</div>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-sfpro text-base hover:text-highlight">
        <Link href={nodeLink}>
          <Tooltip tooltip={activeTokens?.toLocaleString() ?? ''}>
            <div className="text-center">{activeTokens ? formatCash(activeTokens) : ''}</div>
          </Tooltip>
          <div className="text-center">{votingPowerActive.toFixed(2)}%</div>
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
              {selfDelegation !== undefined && selfDelegation !== null ? formatCash(selfDelegation) : '-'}
            </div>
          </Tooltip>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-sfpro text-base">
        {item.uptime !== undefined && item.uptime !== null ? (
          <Tooltip
            tooltip={
              isAztecNetwork
                ? [
                    `Per ${totalSlots ? totalSlots.toLocaleString() : item.chain.params?.blocksWindow?.toLocaleString()} slots`,
                    item.totalSlotsAttestations != null && item.totalSlotsAttestations > 0
                      ? `Attested: ${(((item.totalSlotsAttestations - (item.missedSlotsAttestations ?? 0)) / item.totalSlotsAttestations) * 100).toFixed(2)}%`
                      : 'Attested: -',
                    item.totalSlotsProposals != null && item.totalSlotsProposals > 0
                      ? `Proposed: ${(((item.totalSlotsProposals - (item.missedSlotsProposals ?? 0)) / item.totalSlotsProposals) * 100).toFixed(2)}%`
                      : 'Proposed: -',
                  ].join('\n')
                : `Per ${totalSlots ? totalSlots.toLocaleString() : item.chain.params?.blocksWindow?.toLocaleString()} ${chainsWithSlots.includes(item.chain.name) ? 'slots' : 'blocks'}`
            }
          >
            <div className="text-center" style={{ color: colorStylization.uptime(item.uptime) }}>
              {item.uptime.toFixed(2)}%
            </div>
          </Tooltip>
        ) : (
          <div className="text-center">-</div>
        )}
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-sfpro text-base">
        {item.missedBlocks !== undefined && item.missedBlocks !== null ? (
          <Tooltip
            tooltip={
              isAztecNetwork
                ? [
                    `Per ${totalSlots ? totalSlots.toLocaleString() : item.chain.params?.blocksWindow?.toLocaleString()} slots`,
                    `Attested: ${item.missedSlotsAttestations != null ? item.missedSlotsAttestations : '-'}`,
                    `Proposed: ${item.missedSlotsProposals != null ? item.missedSlotsProposals : '-'}`,
                  ].join('\n')
                : `Per ${totalSlots ? totalSlots.toLocaleString() : item.chain.params?.blocksWindow?.toLocaleString()} ${chainsWithSlots.includes(item.chain.name) ? 'slots' : 'blocks'}`
            }
          >
            <div className="text-center">{item.missedBlocks}</div>
          </Tooltip>
        ) : (
          <div className="text-center">-</div>
        )}
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-sfpro text-base">
        <div className="text-center">
          {item.totalEarnedRewards && item.chain.params?.coinDecimals != null
            ? formatCash(+item.totalEarnedRewards / 10 ** item.chain.params.coinDecimals)
            : '-'}
        </div>
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-sfpro text-base">
        <Link href={nodeLink}>
          <div className="flex items-center justify-center text-center">
            <Image src={icons.CheckmarkIcon} alt="Infrastructure is active" width={30} height={30} />
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

export default NetworkValidatorsItem;
