'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import CopyButton from '@/components/common/copy-button';
import BaseTableCell from '@/components/common/table/base-table-cell';
import BaseTableRow from '@/components/common/table/base-table-row';
import Tooltip from '@/components/common/tooltip';
import icons from '@/components/icons';
import type { TxAmountContext, TxByAddressItem, TxStatus, TxTransferItem } from '@/services/tx-service';
import { type TransferClassification, classifyTransfer } from '@/utils/classify-transfer';
import { cn } from '@/utils/cn';
import cutHash from '@/utils/cut-hash';
import { formatBaseUnits } from '@/utils/decimal-string';
import { formatTimestamp } from '@/utils/format-timestamp';
import { parseMessage } from '@/utils/parse-proposal-message';

interface OwnProps {
  item: TxByAddressItem;
  chainName: string;
  amountContext: TxAmountContext | null;
}

const getStatusIcon = (status: TxStatus) => {
  switch (status) {
    case 'pending':
      return icons.YellowSquareIcon;
    case 'confirmed':
      return icons.GreenSquareIcon;
    case 'dropped':
      return icons.RedSquareIcon;
  }
};

const formatTransferAmount = (transfer: TxTransferItem, amountContext: TxAmountContext): string => {
  if (transfer.denom !== amountContext.minimalDenom) return `${transfer.amount} ${transfer.denom}`;

  try {
    return `${formatBaseUnits(transfer.amount, amountContext.coinDecimals)} ${amountContext.denom}`;
  } catch {
    return `${transfer.amount} ${transfer.denom}`;
  }
};

const getDirectionArrow = (classification: TransferClassification): string => {
  if (classification.direction === 'in') return '↓';
  if (classification.direction === 'out') return '↑';
  return '';
};

const getTransferDisplay = (
  transfer: TxTransferItem,
  item: TxByAddressItem,
  chainName: string,
  amountContext: TxAmountContext,
): { amount: string; classification: TransferClassification } => {
  // The fallback also protects client-side rows restored from a pre-upgrade Redis cache entry.
  const classification = classifyTransfer(transfer, item.msgTypes ?? [], amountContext.accountAddress, chainName);
  const arrow = getDirectionArrow(classification);
  const amount = formatTransferAmount(transfer, amountContext);
  return { amount: arrow ? `${arrow} ${amount}` : amount, classification };
};

// Shared Cosmos tx row: four columns for validators, plus Amount for account history. Consolidates
// the former account/node item components and stays client-side for cursor-driven pagination.
const TxRow: FC<OwnProps> = ({ item, chainName, amountContext }) => {
  const t = useTranslations('AccountPage.Transactions');
  // opType is the raw message type_url (e.g. /cosmos.bank.v1beta1.MsgSend); parseMessage humanizes it.
  const type = item.opType ? parseMessage(item.opType) : '—';
  const txLink = `/networks/${chainName}/tx/${encodeURIComponent(item.hash)}`;
  const timestamp = item.timestamp ? formatTimestamp(new Date(item.timestamp)) : '—';
  const firstTransfer = amountContext && item.transfers.length > 0 ? item.transfers[0] : null;
  const firstTransferDisplay =
    firstTransfer && amountContext ? getTransferDisplay(firstTransfer, item, chainName, amountContext) : null;
  const transferTooltip =
    amountContext && item.transfers.length > 1
      ? [
          ...item.transfers.map((transfer) => {
            const display = getTransferDisplay(transfer, item, chainName, amountContext);
            return `${display.amount}\n${transfer.fromAddr} → ${transfer.toAddr}`;
          }),
          t('transfersTooltipCap'),
        ].join('\n\n')
      : '';
  const cellWidth = amountContext ? 'w-1/5' : 'w-1/4';
  const isMutedAmount =
    firstTransferDisplay?.classification.kind === 'module_transfer' ||
    firstTransferDisplay?.classification.kind === 'fee_or_reward';

  return (
    <BaseTableRow>
      <BaseTableCell className={cn(cellWidth, 'py-4 text-base hover:text-highlight')}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Image src={getStatusIcon(item.status)} alt={item.status} width={30} height={30} />
          </div>
          <div className="flex-grow text-center">{type}</div>
        </div>
      </BaseTableCell>
      <BaseTableCell className={cn(cellWidth, 'px-2 py-2 hover:text-highlight')}>
        <div className="flex items-center justify-center">
          <Link href={txLink} className="flex justify-center">
            <div className="underline-offset-3 text-center font-handjet text-lg underline">
              {cutHash({ value: item.hash })}
            </div>
          </Link>
          <CopyButton value={item.hash} size="md" />
        </div>
      </BaseTableCell>
      <BaseTableCell className={cn(cellWidth, 'px-2 py-2 hover:text-highlight')}>
        <div className="flex items-center justify-center gap-1 text-center text-base">
          <span>{timestamp}</span>
          {item.timestamp != null && <CopyButton value={timestamp} size="md" />}
        </div>
      </BaseTableCell>
      <BaseTableCell className={cn(cellWidth, 'px-2 py-2 hover:text-highlight')}>
        {item.blockHeight != null ? (
          <Link href={`/networks/${chainName}/blocks/${item.blockHeight}`} className="flex justify-center">
            <div className="text-center font-handjet text-lg underline underline-offset-2">
              {item.blockHeight.toLocaleString('en-US')}
            </div>
          </Link>
        ) : (
          <div className="text-center font-handjet text-lg">—</div>
        )}
      </BaseTableCell>
      {amountContext ? (
        <BaseTableCell className={cn(cellWidth, 'px-2 py-2 text-center hover:text-highlight')}>
          {firstTransferDisplay ? (
            <Tooltip tooltip={transferTooltip} direction="top">
              <span
                className={cn('font-handjet text-lg', isMutedAmount && 'text-white/45')}
                aria-label={transferTooltip || firstTransferDisplay.amount}
                tabIndex={item.transfers.length > 1 ? 0 : undefined}
              >
                {firstTransferDisplay.amount}
                {item.transfers.length > 1 ? ` +${item.transfers.length - 1}` : ''}
              </span>
            </Tooltip>
          ) : (
            <span className="font-handjet text-lg">—</span>
          )}
        </BaseTableCell>
      ) : null}
    </BaseTableRow>
  );
};

export default TxRow;
