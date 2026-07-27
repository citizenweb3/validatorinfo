'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { FC } from 'react';

import CopyButton from '@/components/common/copy-button';
import BaseTableCell from '@/components/common/table/base-table-cell';
import BaseTableRow from '@/components/common/table/base-table-row';
import Tooltip from '@/components/common/tooltip';
import type { TransferFeedItem } from '@/services/transfer-feed-service';
import { cn } from '@/utils/cn';
import cutHash from '@/utils/cut-hash';
import { formatTimestamp } from '@/utils/format-timestamp';
import { formatTransferAmount } from '@/utils/known-denoms';

interface OwnProps {
  item: TransferFeedItem;
  chainName: string;
  accountAddress: string;
}

const TransferRow: FC<OwnProps> = ({ item, chainName, accountAddress }) => {
  const t = useTranslations('AccountPage.Tokens');
  const isOutgoing = item.fromAddr === accountAddress;
  const isSelf = item.fromAddr === item.toAddr;
  const counterparty = isOutgoing ? item.toAddr : item.fromAddr;
  const amount = formatTransferAmount(chainName, item.amount, item.denom);
  const txLink = `/networks/${chainName}/tx/${encodeURIComponent(item.txHash)}`;

  return (
    <BaseTableRow>
      <BaseTableCell className="w-1/5 py-4">
        <div
          className={cn(
            'text-center font-sfpro text-sm uppercase tracking-wide',
            isSelf ? 'text-white/70' : isOutgoing ? 'text-red' : 'text-secondary',
          )}
        >
          {isSelf ? t('directionSelf') : isOutgoing ? t('directionOut') : t('directionIn')}
        </div>
      </BaseTableCell>
      <BaseTableCell className="w-1/5 px-2 py-2 hover:text-highlight">
        <div className="flex items-center justify-center">
          <span className="text-center font-handjet text-lg">{cutHash({ value: counterparty })}</span>
          <CopyButton value={counterparty} size="md" />
        </div>
      </BaseTableCell>
      <BaseTableCell className="w-1/5 px-2 py-2 hover:text-highlight">
        <Tooltip tooltip={amount.full} direction="top">
          <div className="cursor-help text-center font-handjet text-lg">{amount.display}</div>
        </Tooltip>
      </BaseTableCell>
      <BaseTableCell className="w-1/5 px-2 py-2 hover:text-highlight">
        <div className="flex items-center justify-center">
          <Link href={txLink} className="flex justify-center">
            <span className="underline-offset-3 text-center font-handjet text-lg underline">
              {cutHash({ value: item.txHash })}
            </span>
          </Link>
          <CopyButton value={item.txHash} size="md" />
        </div>
      </BaseTableCell>
      <BaseTableCell className="w-1/5 px-2 py-2 hover:text-highlight">
        <div className="text-center text-base">{formatTimestamp(new Date(item.time))}</div>
      </BaseTableCell>
    </BaseTableRow>
  );
};

export default TransferRow;
