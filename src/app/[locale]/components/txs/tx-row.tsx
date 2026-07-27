'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import CopyButton from '@/components/common/copy-button';
import BaseTableCell from '@/components/common/table/base-table-cell';
import BaseTableRow from '@/components/common/table/base-table-row';
import icons from '@/components/icons';
import type { TxByAddressItem, TxStatus } from '@/services/tx-service';
import { cn } from '@/utils/cn';
import cutHash from '@/utils/cut-hash';
import { formatTimestamp } from '@/utils/format-timestamp';
import { parseMessage } from '@/utils/parse-proposal-message';

interface OwnProps {
  item: TxByAddressItem;
  chainName: string;
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

// Shared Cosmos tx row for the validator and account history tables. Consolidates the former
// account/node item components and stays client-side for cursor-driven pagination.
const TxRow: FC<OwnProps> = ({ item, chainName }) => {
  // opType is the raw message type_url (e.g. /cosmos.bank.v1beta1.MsgSend); parseMessage humanizes it.
  const type = item.opType ? parseMessage(item.opType) : '—';
  const txLink = `/networks/${chainName}/tx/${encodeURIComponent(item.hash)}`;
  const timestamp = item.timestamp ? formatTimestamp(new Date(item.timestamp)) : '—';
  const cellWidth = 'w-1/4';

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
    </BaseTableRow>
  );
};

export default TxRow;
