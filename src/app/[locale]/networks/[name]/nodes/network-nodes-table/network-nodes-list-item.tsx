import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import CopyButton from '@/components/common/copy-button';
import BaseTableCell from '@/components/common/table/base-table-cell';
import BaseTableRow from '@/components/common/table/base-table-row';
import Tooltip from '@/components/common/tooltip';
import icons from '@/components/icons';
import { NodeWithChainAndConsensus } from '@/services/node-service';
import colorStylization from '@/utils/color-stylization';
import cutHash from '@/utils/cut-hash';
import formatCash from '@/utils/format-cash';
import { getMissedWindow, getMissedWindowMessage } from '@/utils/missed-window';

interface OwnProps {
  item: NodeWithChainAndConsensus;
}

const NetworkNodesListItem: FC<OwnProps> = async ({ item }) => {
  const t = await getTranslations('Common');
  const tokenDelegatorShares =
    item.chain.params?.coinDecimals != null
      ? Number(item.delegatorShares) / 10 ** item.chain.params?.coinDecimals
      : undefined;

  const validatorLink = item.validatorId
    ? `/validators/${item.validatorId}/${item.operatorAddress}/validator_passport/authz/withdraw_rewards`
    : '';

  const totalSlots = item.consensusData?.totalSlots ?? null;
  const isAztecNetwork = ['aztec', 'aztec-testnet'].includes(item.chain.name);
  const missedWindow = getMissedWindow({
    chainName: item.chain.name,
    blocksWindow: item.chain.params?.blocksWindow ?? null,
    totalSlots,
    avgTxInterval: item.chain.avgTxInterval,
  });
  const windowMessage = getMissedWindowMessage(missedWindow);
  const windowTooltip = windowMessage ? t(windowMessage.key, windowMessage.values) : null;

  const uptimeTooltip =
    windowTooltip && isAztecNetwork
      ? [
          windowTooltip,
          item.consensusData?.totalSlotsAttestations != null && item.consensusData.totalSlotsAttestations > 0
            ? `${t('attested')}: ${(((item.consensusData.totalSlotsAttestations - (item.consensusData.missedSlotsAttestations ?? 0)) / item.consensusData.totalSlotsAttestations) * 100).toFixed(2)}%`
            : `${t('attested')}: -`,
          item.consensusData?.totalSlotsProposals != null && item.consensusData.totalSlotsProposals > 0
            ? `${t('proposed')}: ${(((item.consensusData.totalSlotsProposals - (item.consensusData.missedSlotsProposals ?? 0)) / item.consensusData.totalSlotsProposals) * 100).toFixed(2)}%`
            : `${t('proposed')}: -`,
        ].join('\n')
      : windowTooltip;

  const missedBlocksTooltip =
    windowTooltip && isAztecNetwork
      ? [
          windowTooltip,
          `${t('attested')}: ${item.consensusData?.missedSlotsAttestations ?? '-'}`,
          `${t('proposed')}: ${item.consensusData?.missedSlotsProposals ?? '-'}`,
        ].join('\n')
      : windowTooltip;

  const AddressContent = (
    <div className="flex">
      <Image
        src={item?.jailed ? icons.RedSquareIcon : icons.GreenSquareIcon}
        alt={'node status'}
        width={20}
        height={20}
      />
      <Tooltip tooltip={item.operatorAddress} className={'text-base font-normal'}>
        <div className="ml-4">{cutHash({ value: item.operatorAddress, cutLength: 10 })}</div>
      </Tooltip>
      <div className="pl-4">
        <CopyButton value={item.operatorAddress} />
      </div>
    </div>
  );

  const MonikerContent = (
    <div className="break-words break-all text-center">
      {item.moniker && !item.moniker.startsWith('0x') ? item.moniker : '-'}
    </div>
  );

  return (
    <BaseTableRow>
      <BaseTableCell className="w-[20%] py-2 font-handjet text-lg hover:text-highlight">
        {validatorLink ? <Link href={validatorLink}>{AddressContent}</Link> : AddressContent}
      </BaseTableCell>
      <BaseTableCell className="w-[20%] py-2 font-sfpro text-base hover:text-highlight">
        {validatorLink ? <Link href={validatorLink}>{MonikerContent}</Link> : MonikerContent}
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-handjet text-lg hover:text-highlight">
        <Tooltip tooltip={tokenDelegatorShares?.toLocaleString() ?? ''}>
          <div className="text-center">{tokenDelegatorShares ? formatCash(tokenDelegatorShares) : ''}</div>
        </Tooltip>
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-sfpro text-base hover:text-highlight">
        {item.uptime !== undefined && item.uptime !== null ? (
          uptimeTooltip ? (
            <Tooltip tooltip={uptimeTooltip}>
              <div className="text-center" style={{ color: colorStylization.uptime(item.uptime) }}>
                {item.uptime.toFixed(2)}%
              </div>
            </Tooltip>
          ) : (
            <div className="text-center" style={{ color: colorStylization.uptime(item.uptime) }}>
              {item.uptime.toFixed(2)}%
            </div>
          )
        ) : (
          <div className="text-center">-</div>
        )}
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-sfpro text-base hover:text-highlight">
        {item.missedBlocks !== undefined && item.missedBlocks !== null ? (
          missedBlocksTooltip ? (
            <Tooltip tooltip={missedBlocksTooltip}>
              <div className="text-center">{item.missedBlocks}</div>
            </Tooltip>
          ) : (
            <div className="text-center">{item.missedBlocks}</div>
          )
        ) : (
          <div className="text-center">-</div>
        )}
      </BaseTableCell>
      {isAztecNetwork && (
        <BaseTableCell className="px-2 py-2 font-sfpro text-base hover:text-highlight">
          <div className="text-center">
            {item.totalEarnedRewards && item.chain.params?.coinDecimals != null
              ? formatCash(+item.totalEarnedRewards / 10 ** item.chain.params.coinDecimals)
              : '-'}
          </div>
        </BaseTableCell>
      )}
    </BaseTableRow>
  );
};

export default NetworkNodesListItem;
