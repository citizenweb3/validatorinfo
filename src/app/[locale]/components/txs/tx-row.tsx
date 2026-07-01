'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import BaseTableRow from '@/components/common/table/base-table-row';
import BaseTableCell from '@/components/common/table/base-table-cell';
import CopyButton from '@/components/common/copy-button';
import icons from '@/components/icons';
import cutHash from '@/utils/cut-hash';
import { parseMessage } from '@/utils/parse-proposal-message';
import { formatTimestamp } from '@/utils/format-timestamp';
import type { TxItem, TxStatus } from '@/services/tx-service';

interface OwnProps {
  item: TxItem;
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

// Shared cosmos tx row (4 cols: status+type | hash | timestamp | block). Consolidates the former
// account/node item components. Client component so the client-driven tx list can render it directly.
const TxRow: FC<OwnProps> = ({ item, chainName }) => {
  // opType is the raw message type_url (e.g. /cosmos.bank.v1beta1.MsgSend); parseMessage humanizes it.
  const type = item.opType ? parseMessage(item.opType) : '—';
  const txLink = `/networks/${chainName}/tx/${encodeURIComponent(item.hash)}`;
  const timestamp = item.timestamp ? formatTimestamp(new Date(item.timestamp)) : '—';

  return (
    <BaseTableRow>
      <BaseTableCell className="w-1/4 py-4 text-base hover:text-highlight">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Image src={getStatusIcon(item.status)} alt={item.status} width={30} height={30} />
          </div>
          <div className="flex-grow text-center">{type}</div>
        </div>
      </BaseTableCell>
      <BaseTableCell className="w-1/4 px-2 py-2 hover:text-highlight">
        <div className="flex items-center justify-center">
          <Link href={txLink} className="flex justify-center">
            <div className="text-center font-handjet text-lg underline underline-offset-3">
              {cutHash({ value: item.hash })}
            </div>
          </Link>
          <CopyButton value={item.hash} size="md" />
        </div>
      </BaseTableCell>
      <BaseTableCell className="w-1/4 px-2 py-2 hover:text-highlight">
        <div className="flex items-center justify-center gap-1 text-center text-base">
          <span>{timestamp}</span>
          {item.timestamp != null && <CopyButton value={timestamp} size="md" />}
        </div>
      </BaseTableCell>
      <BaseTableCell className="w-1/4 px-2 py-2 hover:text-highlight">
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
